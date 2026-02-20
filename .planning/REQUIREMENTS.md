# Requirements: Pomodoro Timer v1.1

**Defined:** 2026-02-19
**Core Value:** A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## v1.1 Requirements

### Custom Durations

- [ ] **DUR-01**: User can set custom Focus duration (1-60 minutes)
- [ ] **DUR-02**: User can set custom Short Break duration (1-30 minutes)
- [ ] **DUR-03**: User can set custom Long Break duration (1-60 minutes)
- [ ] **DUR-04**: User can select from preset duration options (Classic: 25/5/15, Extended: 50/10/30, Quick: 15/3/10)
- [ ] **DUR-05**: Custom durations are validated against min/max bounds
- [ ] **DUR-06**: Custom durations persist across page refreshes
- [ ] **DUR-07**: Changing duration while timer is running prompts for confirmation
- [ ] **DUR-08**: Timer resets to new duration when changed
- [ ] **DUR-09**: User can reset durations to defaults (25/5/15)

## v2 Requirements

### Additional Features

- **DUR-10**: Custom notification sound selection
- **STAT-05**: Weekly bar chart visualization
- **STAT-06**: Daily streak counter
- **HIST-09**: Export history as CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sync across browser tabs | Not required for v1.1 |
| Custom session count before long break | Keep fixed at 4 for v1.1 |
| Auth or cloud sync | Local-only app |
| Mobile app | Web-only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DUR-01 | Phase 5 | Pending |
| DUR-02 | Phase 5 | Pending |
| DUR-03 | Phase 5 | Pending |
| DUR-04 | Phase 6 | Pending |
| DUR-05 | Phase 5 | Pending |
| DUR-06 | Phase 5 | Pending |
| DUR-07 | Phase 6 | Pending |
| DUR-08 | Phase 5 | Pending |
| DUR-09 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 during v1.1 roadmap creation*
