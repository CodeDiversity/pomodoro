# Roadmap: Pomodoro Timer v2.1

**Milestone:** v2.1 Enhancements
**Goal:** Add Redux Toolkit state management, enhanced stats visualizations, data export, settings modernization, and streak counter
**Phases:** 7-14 (8 phases)
**Requirements:** 32 v2.1 requirements
**Depth:** Standard

---

## Overview

This roadmap delivers v2.1 enhancements through an incremental Redux Toolkit migration, followed by new feature development. The migration follows a slice-based approach mirroring existing hook boundaries (timer, session, history, ui), with persistence handled via custom middleware.

Phase structure prioritizes:
1. **Foundation first** — Redux store and typed hooks must exist before slices
2. **Highest impact first** — Timer slice migration validates architecture early
3. **Dependencies respected** — History depends on session completion, UI state enables testing
4. **Features after foundation** — Stats, streak, export, and settings build on the new state layer

---

## Phase 7: Redux Foundation

**Goal:** Core Redux infrastructure in place with DevTools integration and typed hooks

**Dependencies:** None (foundation phase)

**Requirements:**
| ID | Description |
|----|-------------|
| REDUX-01 | Redux Toolkit store configured with DevTools integration |
| REDUX-02 | Typed hooks (useAppDispatch, useAppSelector) available throughout app |

**Success Criteria:**
1. App renders with Redux Provider without errors
2. Redux DevTools extension shows store state and actions
3. Components can import and use useAppDispatch and useAppSelector with full TypeScript inference
4. Store hot-reloads in development without losing state

**Plans:** 1 plan

Plans:
- [ ] 07-01-PLAN.md — Install Redux Toolkit and configure store with DevTools, typed hooks, and Provider integration

---

## Phase 8: Timer Slice Migration

**Goal:** Timer state migrated from useReducer to Redux with persistence middleware

**Dependencies:** Phase 7 (Redux Foundation)

**Requirements:**
| ID | Description |
|----|-------------|
| REDUX-03 | Timer slice migrated from useReducer (actions: start, pause, resume, tick, skip, reset) |
| REDUX-07 | Custom persistence middleware for IndexedDB sync with debouncing |
| REDUX-08 | Existing hook APIs maintained as compatibility layer (useTimer, etc.) |
| REDUX-09 | Timer accuracy preserved (timestamps, not tick counting) |

**Success Criteria:**
1. Timer starts, pauses, resumes, skips, and resets work identically to pre-migration
2. Timer state persists across page refreshes (time remaining, mode, session count)
3. useTimer hook maintains same API surface — components require no changes
4. Timer accuracy maintained in background tabs (no drift from throttling)
5. Redux DevTools shows timer actions with readable names and state changes

**Plans:** 1 plan

Plans:
- [ ] 08-01-PLAN.md — Create timerSlice.ts, timerMiddleware.ts, update store.ts, refactor useTimer.ts, test accuracy

---

## Phase 9: UI and Session Slices

**Goal:** UI state and session notes migrated to Redux slices

**Dependencies:** Phase 8 (Timer Slice Migration)

**Requirements:**
| ID | Description |
|----|-------------|
| REDUX-04 | Session slice for current session notes and tags |
| REDUX-06 | UI slice for viewMode, modal visibility, drawer state |

**Success Criteria:**
1. viewMode (timer/history/stats/settings) state managed in Redux
2. Modal visibility (settings, help, session summary) controlled via Redux actions
3. History drawer open/close state managed in Redux
4. Session notes and tags save to Redux with same debounced persistence
5. useSessionNotes hook maintains same API — components require no changes

---

## Phase 10: History Slice and Selectors

**Goal:** History state, filters, and search migrated with memoized selectors

**Dependencies:** Phase 9 (UI and Session Slices)

**Requirements:**
| ID | Description |
|----|-------------|
| REDUX-05 | History slice with filters and search query state |
| REDUX-10 | Memoized selectors for derived data (filtered sessions, stats) |

**Success Criteria:**
1. Date range filter (today/7 days/30 days/all) managed in Redux
2. Search query state managed in Redux
3. Filtered sessions computed via memoized selector (createSelector)
4. Stats (today time, 7-day time, sessions today, longest) computed via selectors
5. useSessionHistory hook maintains same API — components require no changes
6. No unnecessary re-renders when unrelated state changes

---

## Phase 11: Settings Modernization

**Goal:** Settings page redesigned and integrated into main layout with custom sounds

**Dependencies:** Phase 9 (UI Slice for view management)

**Requirements:**
| ID | Description |
|----|-------------|
| SETS-01 | Settings page redesigned to match app design system (light mode, blue accents) |
| SETS-02 | Settings integrated into main layout (not modal overlay) |
| SETS-03 | Settings accessible via sidebar navigation |
| SETS-04 | Custom notification sound selection dropdown |
| SETS-05 | Sound preview button for each option |
| SETS-06 | Volume control slider (0-100%) |

**Success Criteria:**
1. Settings renders as full page view, not modal overlay
2. Settings accessible via sidebar "Settings" nav item
3. Visual design matches app design system (light mode, blue accents, consistent spacing)
4. Sound selection dropdown shows available notification sounds
5. Clicking preview button plays selected sound at current volume
6. Volume slider (0-100%) controls all notification sound playback
7. All settings persist to IndexedDB and restore on app load

---

## Phase 12: Stats Visualization

**Goal:** Weekly focus time visualization with bar charts

**Dependencies:** Phase 10 (History Selectors for data)

**Requirements:**
| ID | Description |
|----|-------------|
| STAT-01 | Weekly bar chart showing focus time per day (last 7 days) |
| STAT-02 | Bar chart renders in Stats view |
| STAT-03 | Chart uses app color scheme (blue primary) |
| STAT-04 | Hover shows exact duration for each day |

**Success Criteria:**
1. Stats view displays bar chart with 7 bars (last 7 days)
2. Each bar height represents total focus time for that day
3. Chart uses app blue color scheme (#136dec primary)
4. Hovering a bar shows tooltip with exact duration (e.g., "2h 15m")
5. Days with zero focus time show minimal bar or distinct visual treatment
6. Chart animates on initial render

---

## Phase 13: Streak Counter

**Goal:** Daily streak tracking with calendar view and streak protection

**Dependencies:** Phase 10 (History Selectors for session data)

**Requirements:**
| ID | Description |
|----|-------------|
| STRK-01 | Current streak displayed in header/badge |
| STRK-02 | Best streak tracked and displayed |
| STRK-03 | Streak calculated based on consecutive days with focus sessions |
| STRK-04 | Streak calendar view showing daily activity |
| STRK-05 | Calendar color coding: light blue (1-2 sessions) → dark blue (5+ sessions) |
| STRK-06 | Streak protection: 1 free miss allowed for 5+ day streaks |
| STRK-07 | Streak data persisted to IndexedDB |

**Success Criteria:**
1. Current streak badge visible in header or stats view
2. Best streak (all-time high) displayed alongside current streak
3. Streak increments when user completes focus session on consecutive days
4. Streak calendar shows monthly view with color-coded days by session count
5. Calendar legend explains color scale (light to dark blue)
6. Streak protection allows 1 missed day for streaks 5+ days without breaking
7. Streak state persists across app restarts

---

## Phase 14: Data Export & Import

**Goal:** Export and import session history as CSV for data portability between devices

**Dependencies:** Phase 10 (History Slice for data access)

**Requirements:**
| ID | Description |
|----|-------------|
| EXPT-01 | Export button in History view |
| EXPT-02 | Date range filter for export (today/7 days/30 days/all) |
| EXPT-03 | CSV format with columns: date, duration, mode, notes, tags |
| EXPT-04 | Filename: pomodoro-sessions-YYYY-MM-DD.csv |
| EXPT-05 | Download triggers browser file download |
| IMPT-01 | Import button in Settings view |
| IMPT-02 | File picker accepts CSV files exported from app |
| IMPT-03 | Import validates CSV format and columns |
| IMPT-04 | Imported sessions merged with existing (no duplicates) |
| IMPT-05 | Import progress shown with success/error feedback |

**Success Criteria:**
1. Export button visible in History view (top toolbar)
2. Date range selector allows choosing today/7 days/30 days/all
3. Clicking export generates CSV with correct columns
4. CSV contains UTF-8 encoded data with proper escaping for commas/quotes
5. Filename includes current date (pomodoro-sessions-2026-02-21.csv)
6. Browser initiates file download without page navigation
7. Export respects current search/filter if user wants filtered export
8. Import button in Settings opens file picker
9. Import validates CSV structure and shows error for invalid files
10. Import merges sessions without creating duplicates
11. Import progress indicator shows during processing
12. Success/error feedback displayed after import completes

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 7 - Redux Foundation | Pending | 2 | 0% |
| 8 - Timer Slice Migration | Planned | 4 | 0% |
| 9 - UI and Session Slices | Pending | 2 | 0% |
| 10 - History Slice and Selectors | Pending | 2 | 0% |
| 11 - Settings Modernization | Pending | 6 | 0% |
| 12 - Stats Visualization | Pending | 4 | 0% |
| 13 - Streak Counter | Pending | 7 | 0% |
| 14 - Data Export & Import | Pending | 10 | 0% |

**Overall:** 0/37 requirements complete (0%)

---

## Dependencies Graph

```
Phase 7 (Foundation)
    ↓
Phase 8 (Timer Slice)
    ↓
Phase 9 (UI + Session Slices)
    ↓
    ├──→ Phase 10 (History + Selectors)
    │         ↓
    │         ├──→ Phase 12 (Stats Visualization)
    │         ├──→ Phase 13 (Streak Counter)
    │         └──→ Phase 14 (Data Export)
    │
    └──→ Phase 11 (Settings Modernization)
```

---

## Risk Mitigation

| Risk | Phase | Mitigation |
|------|-------|------------|
| Timer drift in background tabs | 8 | Use timestamps (Date.now()) not tick counting; recalculate on visibility change |
| Stale closures in React effects | 8 | Functional state updates, proper dependency arrays |
| State loss on refresh | 8 | Persistence middleware with debounced IndexedDB sync |
| Bundle size increase | 7 | ~16KB gzipped acceptable for debugging benefits |
| Hook API breakage | 8-10 | Maintain compatibility layer, internal implementation only |

---

*Created: 2026-02-21*
*Next: /gsd:plan-phase 7*
