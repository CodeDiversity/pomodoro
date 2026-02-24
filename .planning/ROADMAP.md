# Roadmap: Pomodoro Timer v2.2

**Milestone:** v2.2 Features
**Goal:** Add daily streak tracking and data export/import capabilities
**Created:** 2026-02-23
**Depth:** Standard

---

## Overview

This roadmap delivers v2.2 features building on the foundation from v2.1.

## Phases

- [x] **Phase 13: Streak Tracking** - Current/best streak display, calendar heatmap
- [x] **Phase 14: Data Export/Import** - CSV export from History, CSV import from Settings (completed 2026-02-24)
- [ ] **Phase 15: Integration & Polish** - Edge cases, UI polish, streak persistence

---

## Phase Details

### Phase 13: Streak Tracking

**Goal:** Users can view their daily focus streaks and view activity in a calendar heatmap

**Depends on:** Previous milestone (v2.1)

**Requirements:** STRK-01, STRK-02, STRK-03, STRK-04, STRK-05, STRK-06, STRK-07

**Success Criteria** (what must be TRUE):
1. Current streak count displays in the header/stats view and updates after each focus session
2. Best (longest) streak is tracked and displayed, persisting across app restarts
3. Streak increments only when user completes a focus session of at least 5 minutes on consecutive days
4. Calendar view shows monthly grid with activity indicators for each day
5. Calendar uses color coding: light blue for 1-2 sessions, progressively darker blue for 3-4 sessions, dark blue for 5+ sessions
6. Users with 5+ day streaks can miss one day without losing their streak (streak protection)
7. Streak data persists to IndexedDB and survives browser refresh

**Plans:** 3/3 plans complete

**Plan list:**
- [x] 13-01-PLAN.md - Streak Redux infrastructure with persistence
- [x] 13-02-PLAN.md - Streak display and calendar heatmap UI
- [x] 13-03-PLAN.md - IndexedDB schema and session completion integration

---

### Phase 14: Data Export/Import

**Goal:** Users can export their session history as CSV and import previously exported data

**Depends on:** Phase 13

**Requirements:** EXPT-01, EXPT-02, EXPT-03, EXPT-04, EXPT-05, IMPT-01, IMPT-02, IMPT-03, IMPT-04, IMPT-05

**Success Criteria** (what must be TRUE):
1. Export button appears in History view and triggers CSV download
2. Export respects date range filter (today/7 days/30 days/all)
3. CSV file contains columns: date, duration, mode, notes, tags
4. Exported filename follows format: pomodoro-sessions-YYYY-MM-DD.csv
5. Import button appears in Settings view and opens file picker
6. File picker only accepts CSV file types
7. Import validates CSV format and shows error for invalid files
8. Imported sessions are merged with existing sessions without duplicates
9. Import shows progress feedback during processing and success/error summary after

**Plans:** 2/2 plans complete

**Plan list:**
- [x] 14-01-PLAN.md - Data Export from History view to CSV
- [ ] 14-02-PLAN.md - Data Import from CSV in Settings view

---

### Phase 15: Integration & Polish

**Goal:** Final integration, edge case handling, and UX refinement for streak and data features

**Depends on:** Phase 14

**Requirements:** None (cross-cutting polish)

**Success Criteria** (what must be TRUE):
1. Streak calculation handles timezone edge cases correctly (midnight boundaries)
2. CSV import handles large files (1000+ sessions) without freezing the UI
3. Import handles duplicate sessions gracefully (detects and skips duplicates)
4. All new features follow existing app styling (light mode, blue accents)
5. All features work correctly after app refresh (persistence verified)

**Plans:** 2 plans

**Plan list:**
- [ ] 15-01-PLAN.md — Fix styling inconsistencies (Import button, StreakDisplay, import spinner)
- [ ] 15-02-PLAN.md — Verify timezone, persistence, and batch processing implementations

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 13. Streak Tracking | 3/3 | Complete    | 2026-02-23 |
| 14. Data Export/Import | 2/2 | Complete    | 2026-02-24 |
| 15. Integration & Polish | 0/2 | Not started | - |

---

## Coverage

**v2.2 Requirements:** 17 total
- Streak Tracking: 7 requirements (STRK-01 through STRK-07)
- Data Export: 5 requirements (EXPT-01 through EXPT-05)
- Data Import: 5 requirements (IMPT-01 through IMPT-05)

**Mapped to phases:** 17/17
- Phase 13: 7 requirements (all streak)
- Phase 14: 10 requirements (export + import)
- Phase 15: 0 requirements (cross-cutting polish)

**Unmapped:** 0

---

*Created: 2026-02-23*
*Next: /gsd:plan-phase 13*
