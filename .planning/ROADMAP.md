# Roadmap: Pomodoro Timer v2.2

**Milestone:** v2.2 Features
**Goal:** Add streak counter, data export/import, and complete remaining features
**Phases:** 13-15 (3 phases)
**Requirements:** 17 requirements
**Depth:** Standard

---

## Overview

This roadmap delivers v2.2 features building on the Redux foundation from v2.1.

Phase structure:
1. **Streak Counter** — Daily streak tracking with calendar view
2. **Data Export/Import** — CSV export and import for data portability
3. **Phase 7 Verification** — Complete verification for Redux Foundation

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
| STRK-05 | Calendar color coding: light blue (1-2 sessions) -> dark blue (5+ sessions) |
| STRK-06 | Streak protection: 1 free miss allowed for 5+ day streaks |
| STRK-07 | Streak data persisted to IndexedDB |

**Plans:** 1 plan

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

**Plans:** 1 plan

---

## Phase 15: Phase 7 Verification

**Goal:** Create VERIFICATION.md for Phase 7 (Redux Foundation) to confirm requirements satisfied

**Dependencies:** Phase 7 (Redux Foundation) - complete

**Requirements:** N/A (tech debt closure)

---

## Milestones

- **v2.1 Enhancements** — Phases 7-12 (shipped 2026-02-23)
- **v2.2 Features** — Phases 13-15 (in progress)

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 7 - Redux Foundation | Complete | 2 | 100% |
| 8 - Timer Slice Migration | Complete | 4 | 100% |
| 9 - UI and Session Slices | Complete | 2 | 100% |
| 10 - History Slice and Selectors | Complete | 2 | 100% |
| 11 - Settings Modernization | Complete | 6 | 100% |
| 12 - Stats Visualization | Complete | 4 | 100% |
| 13 - Streak Counter | Pending | 7 | 0% |
| 14 - Data Export & Import | Pending | 10 | 0% |
| 15 - Phase 7 Verification | Pending | 0 | 0% |

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
    │         ├──→ Phase 12 (Stats Visualization) - Complete
    │         ├──→ Phase 13 (Streak Counter)
    │         └──→ Phase 14 (Data Export)
    │
    └──→ Phase 11 (Settings Modernization) - Complete
```

---

*Created: 2026-02-23*
*Next: /gsd:plan-phase 13*
