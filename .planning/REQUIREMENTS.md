# Requirements: Pomodoro Timer v2.2

**Defined:** 2026-02-23
**Core Value:** A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## v2.2 Requirements

### Streak Tracking

- [x] **STRK-01**: Current streak displayed in header/stats view
- [x] **STRK-02**: Best (longest) streak tracked and displayed
- [x] **STRK-03**: Streak calculated based on consecutive days with focus sessions (minimum 5 minutes)
- [ ] **STRK-04**: Streak calendar view showing monthly grid with daily activity
- [ ] **STRK-05**: Calendar color coding: light blue (1-2 sessions) -> dark blue (5+ sessions)
- [x] **STRK-06**: Streak protection: 1 free miss allowed for 5+ day streaks
- [x] **STRK-07**: Streak data persisted to IndexedDB

### Data Export

- [ ] **EXPT-01**: Export button in History view
- [ ] **EXPT-02**: Date range filter for export (today/7 days/30 days/all)
- [ ] **EXPT-03**: CSV format with columns: date, duration, mode, notes, tags
- [ ] **EXPT-04**: Filename: pomodoro-sessions-YYYY-MM-DD.csv
- [ ] **EXPT-05**: Download triggers browser file download

### Data Import

- [ ] **IMPT-01**: Import button in Settings view
- [ ] **IMPT-02**: File picker accepts CSV files exported from app
- [ ] **IMPT-03**: Import validates CSV format and required columns
- [ ] **IMPT-04**: Imported sessions merged with existing (no duplicates based on ID)
- [ ] **IMPT-05**: Import progress shown with success/error feedback

## v2.1 Validated (Shipped 2026-02-23)

### State Management (Redux Toolkit)

- [x] **REDUX-01**: Redux Toolkit store configured with DevTools integration
- [x] **REDUX-02**: Typed hooks (useAppDispatch, useAppSelector) available throughout app
- [x] **REDUX-03**: Timer slice migrated from useReducer (actions: start, pause, resume, tick, skip, reset)
- [x] **REDUX-04**: Session slice for current session notes and tags
- [x] **REDUX-05**: History slice with filters and search query state
- [x] **REDUX-06**: UI slice for viewMode, modal visibility, drawer state
- [x] **REDUX-07**: Custom persistence middleware for IndexedDB sync with debouncing
- [x] **REDUX-08**: Existing hook APIs maintained as compatibility layer (useTimer, useSessionNotes, etc.)
- [x] **REDUX-09**: Timer accuracy preserved (timestamps, not tick counting)
- [x] **REDUX-10**: Memoized selectors for derived data (filtered sessions, stats)

### Settings Modernization

- [x] **SETS-01**: Settings page redesigned to match app design system (light mode, blue accents)
- [x] **SETS-02**: Settings integrated into main layout (not modal overlay)
- [x] **SETS-03**: Settings accessible via sidebar navigation
- [x] **SETS-04**: Custom notification sound selection dropdown
- [x] **SETS-05**: Sound preview button for each option
- [x] **SETS-06**: Volume control slider (0-100%)

### Stats Visualization

- [x] **STAT-01**: Weekly bar chart showing focus time per day (last 7 days)
- [x] **STAT-02**: Bar chart renders in Stats view
- [x] **STAT-03**: Chart uses app color scheme (blue primary)
- [x] **STAT-04**: Hover shows exact duration for each day

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync | Local-only app, no backend |
| Real-time sharing | Not needed |
| Advanced analytics | Stats requirement is simple |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRK-01 | Phase 13 | Complete |
| STRK-02 | Phase 13 | Complete |
| STRK-03 | Phase 13 | Complete |
| STRK-04 | Phase 13 | Pending |
| STRK-05 | Phase 13 | Pending |
| STRK-06 | Phase 13 | Complete |
| STRK-07 | Phase 13 | Complete |
| EXPT-01 | Phase 14 | Pending |
| EXPT-02 | Phase 14 | Pending |
| EXPT-03 | Phase 14 | Pending |
| EXPT-04 | Phase 14 | Pending |
| EXPT-05 | Phase 14 | Pending |
| IMPT-01 | Phase 14 | Pending |
| IMPT-02 | Phase 14 | Pending |
| IMPT-03 | Phase 14 | Pending |
| IMPT-04 | Phase 14 | Pending |
| IMPT-05 | Phase 14 | Pending |

**Coverage:**
- v2.2 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 after milestone v2.2 kickoff*
