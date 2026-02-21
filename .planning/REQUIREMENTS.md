# Requirements: Pomodoro Timer v2.1

**Defined:** 2026-02-21
**Core Value:** A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## v2.1 Requirements

### State Management (Redux Toolkit)

- [ ] **REDUX-01**: Redux Toolkit store configured with DevTools integration
- [ ] **REDUX-02**: Typed hooks (useAppDispatch, useAppSelector) available throughout app
- [ ] **REDUX-03**: Timer slice migrated from useReducer (actions: start, pause, resume, tick, skip, reset)
- [ ] **REDUX-04**: Session slice for current session notes and tags
- [ ] **REDUX-05**: History slice with filters and search query state
- [ ] **REDUX-06**: UI slice for viewMode, modal visibility, drawer state
- [ ] **REDUX-07**: Custom persistence middleware for IndexedDB sync with debouncing
- [ ] **REDUX-08**: Existing hook APIs maintained as compatibility layer (useTimer, useSessionNotes, etc.)
- [ ] **REDUX-09**: Timer accuracy preserved (timestamps, not tick counting)
- [ ] **REDUX-10**: Memoized selectors for derived data (filtered sessions, stats)

### Settings Modernization

- [ ] **SETS-01**: Settings page redesigned to match app design system (light mode, blue accents)
- [ ] **SETS-02**: Settings integrated into main layout (not modal overlay)
- [ ] **SETS-03**: Settings accessible via sidebar navigation
- [ ] **SETS-04**: Custom notification sound selection dropdown
- [ ] **SETS-05**: Sound preview button for each option
- [ ] **SETS-06**: Volume control slider (0-100%)

### Stats Visualization

- [ ] **STAT-01**: Weekly bar chart showing focus time per day (last 7 days)
- [ ] **STAT-02**: Bar chart renders in Stats view
- [ ] **STAT-03**: Chart uses app color scheme (blue primary)
- [ ] **STAT-04**: Hover shows exact duration for each day

### Streak Counter

- [ ] **STRK-01**: Current streak displayed in header/badge
- [ ] **STRK-02**: Best streak tracked and displayed
- [ ] **STRK-03**: Streak calculated based on consecutive days with focus sessions
- [ ] **STRK-04**: Streak calendar view showing daily activity
- [ ] **STRK-05**: Calendar color coding: light blue (1-2 sessions) → dark blue (5+ sessions)
- [ ] **STRK-06**: Streak protection: 1 free miss allowed for 5+ day streaks
- [ ] **STRK-07**: Streak data persisted to IndexedDB

### Data Export

- [ ] **EXPT-01**: Export button in History view
- [ ] **EXPT-02**: Date range filter for export (today/7 days/30 days/all)
- [ ] **EXPT-03**: CSV format with columns: date, duration, mode, notes, tags
- [ ] **EXPT-04**: Filename: pomodoro-sessions-YYYY-MM-DD.csv
- [ ] **EXPT-05**: Download triggers browser file download

## v2.2+ Requirements (Deferred)

### Notifications

- **NOTF-01**: Streak reminder notification before midnight
- **NOTF-02**: Milestone celebration share cards (7/30/100 days)

### Performance

- **PERF-01**: Virtual scrolling for large history lists (>1000 sessions)
- **PERF-02**: Service worker for offline support

## Out of Scope

| Feature | Reason |
|---------|--------|
| Redux Persist library | Custom middleware preferred for control over IndexedDB |
| RTK Query | No server state; IndexedDB is client-only |
| Social leaderboards | No backend, no user accounts |
| Streak sync across devices | Local-only app |
| Complex analytics | Keep stats simple per core value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REDUX-01 | Phase 7 | Pending |
| REDUX-02 | Phase 7 | Pending |
| REDUX-03 | Phase 8 | Pending |
| REDUX-04 | Phase 9 | Pending |
| REDUX-05 | Phase 10 | Pending |
| REDUX-06 | Phase 9 | Pending |
| REDUX-07 | Phase 8 | Pending |
| REDUX-08 | Phase 8-10 | Pending |
| REDUX-09 | Phase 8 | Pending |
| REDUX-10 | Phase 10 | Pending |
| SETS-01 | Phase 11 | Pending |
| SETS-02 | Phase 11 | Pending |
| SETS-03 | Phase 11 | Pending |
| SETS-04 | Phase 11 | Pending |
| SETS-05 | Phase 11 | Pending |
| SETS-06 | Phase 11 | Pending |
| STAT-01 | Phase 12 | Pending |
| STAT-02 | Phase 12 | Pending |
| STAT-03 | Phase 12 | Pending |
| STAT-04 | Phase 12 | Pending |
| STRK-01 | Phase 13 | Pending |
| STRK-02 | Phase 13 | Pending |
| STRK-03 | Phase 13 | Pending |
| STRK-04 | Phase 13 | Pending |
| STRK-05 | Phase 13 | Pending |
| STRK-06 | Phase 13 | Pending |
| STRK-07 | Phase 13 | Pending |
| EXPT-01 | Phase 14 | Pending |
| EXPT-02 | Phase 14 | Pending |
| EXPT-03 | Phase 14 | Pending |
| EXPT-04 | Phase 14 | Pending |
| EXPT-05 | Phase 14 | Pending |

**Coverage:**
- v2.1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---

*Requirements defined: 2026-02-21*
*Last updated: 2026-02-21 after research synthesis*
