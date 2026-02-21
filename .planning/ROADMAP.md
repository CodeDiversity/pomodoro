# Pomodoro Timer Roadmap

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-02-19)
- ✅ **v1.1 Custom Durations** — Phases 5-05.1 (shipped 2026-02-21)

## Phases

- [x] **Phase 5: Custom Durations Core** - Data layer, timer integration, Settings UI
- [x] **Phase 05.1: Modernize UI** - Design system and component modernization (INSERTED)

**Phase 5 Status:** COMPLETE
**Phase 05.1 Status:** COMPLETE (2026-02-21)

---

### Phase 5: Custom Durations Core

**Goal:** Users can set and persist custom timer durations that the timer uses

**Depends on:** Phase 4 (v1.0)

**Requirements:** DUR-01, DUR-02, DUR-03, DUR-05, DUR-06, DUR-08

**Success Criteria** (what must be TRUE):

1. User can input custom Focus duration between 1-60 minutes in Settings
2. User can input custom Short Break duration between 1-30 minutes in Settings
3. User can input custom Long Break duration between 1-60 minutes in Settings
4. Duration inputs enforce min/max bounds and reject invalid values (DUR-05)
5. Custom durations are saved to IndexedDB and restored on page refresh (DUR-06)
6. Timer uses custom durations when set (DUR-08 - timer resets to new duration)

**Plans:** 2 plans

- [x] 05-01-PLAN.md - Data layer & timer integration
- [x] 05-02-PLAN.md - Settings UI

---

### Phase 05.1: Modernize notes and buttons for better UX and professional look (INSERTED)

**Goal:** Modernize notes input and buttons throughout the app with consistent border-radius, shadows, focus rings, and transitions for a professional look

**Depends on:** Phase 5

**Plans:** 4 plans

- [x] 05.1-01-PLAN.md - Design system foundation (theme, Button, Input, Chip)
- [x] 05.1-02-PLAN.md - Core component modernization (TimerControls, NotePanel, TagInput)
- [x] 05.1-03-PLAN.md - Settings and navigation (Settings, App tabs, HelpPanel)
- [x] 05.1-04-PLAN.md - Modal and history components (SessionSummary, HistoryList, HistoryItem)

---

## Progress Table

| Phase | Goal | Requirements | Success Criteria | Plans Complete | Status | Completed |
|-------|------|--------------|------------------|----------------|--------|-----------|
| 5 - Custom Durations Core | Set and persist custom timer durations | DUR-01, DUR-02, DUR-03, DUR-05, DUR-06, DUR-08 | 6 criteria | 2/2 | Complete | 2026-02-20 |
| 05.1 - Modernize UI | Professional UI with consistent design | N/A (UX improvement) | 4 artifacts | 4/4 | Complete | 2026-02-21 |
| 6 - Redesign | v2.0 UI Redesign with light mode and sidebar | N/A (visual redesign) | 4 artifacts | 4/4 | Complete | 2026-02-21 |
| 6.1 - Timer Refinement | Timer view layout improvements | N/A (layout refinement) | TBD | 0/1 | Not Started | - |

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| DUR-01: Custom Focus duration (1-60 min) | Phase 5 | Implemented (plan 02) |
| DUR-02: Custom Short Break duration (1-30 min) | Phase 5 | Implemented (plan 02) |
| DUR-03: Custom Long Break duration (1-60 min) | Phase 5 | Implemented (plan 02) |
| DUR-05: Duration validation bounds | Phase 5 | Implemented (plan 02) |
| DUR-06: Duration persistence | Phase 5 | Implemented (plan 01) |
| DUR-08: Timer resets to new duration | Phase 5 | Implemented (plan 01) |

**Removed:** DUR-04, DUR-07, DUR-09 (with Phase 6)

**Total:** 6/6 requirements implemented

### Phase 6: redesign

**Goal:** Complete visual redesign transitioning from dark mode to clean, modern light-mode aesthetic with blue accents. Includes new layout structure (sidebar navigation, split-pane timer view), circular timer with progress ring, card-based history, and refined typography. All existing functionality preserved.

**Depends on:** Phase 05.1

**Plans:** 4 plans

- [x] 06-01-PLAN.md — Foundation: Theme, layout shell, sidebar navigation
- [x] 06-02-PLAN.md — Timer View: Circular timer, split-pane layout, notes panel redesign
- [x] 06-03-PLAN.md — History View: Card-based history, search/filter UI
- [x] 06-04-PLAN.md — Settings & Polish: Settings redesign, final touches, cleanup

**Phase 6 Status:** COMPLETE (2026-02-21)

---

### Phase 6.1: Timer View Refinement

**Goal:** Refine the timer view layout with full-height split panel, repositioned daily goal indicator, updated top bar with session status, and improved right panel structure with Complete Session button at bottom.

**Depends on:** Phase 6

**Plans:** 1 plan

- [ ] 06.1-01-PLAN.md — Timer layout refinements and component positioning

---

*Roadmap for v1.1 Custom Durations*
*Created: 2026-02-19*
