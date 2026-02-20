# Pomodoro Timer Roadmap

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-02-19)
- 🚧 **v1.1 Custom Durations** — Phases 5-6 (in progress)

## Phases

- [ ] **Phase 5: Custom Durations Core** - Data layer, timer integration, Settings UI
- [ ] **Phase 6: Presets & Polish** - Presets, confirmation dialogs, reset to defaults

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

- [ ] 05-01-PLAN.md - Data layer & timer integration
- [ ] 05-02-PLAN.md - Settings UI

---

### Phase 6: Presets & Polish

**Goal:** Users can quickly select preset configurations and get confirmation when changing active timers

**Depends on:** Phase 5

**Requirements:** DUR-04, DUR-07, DUR-09

**Success Criteria** (what must be TRUE):

1. User can select from preset duration options (Classic: 25/5/15, Extended: 50/10/30, Quick: 15/3/10) (DUR-04)
2. Changing duration while timer is running prompts for confirmation dialog (DUR-07)
3. User can reset all durations to default values (25/5/15) with one action (DUR-09)

**Plans:** TBD

---

## Progress Table

| Phase | Goal | Requirements | Success Criteria | Plans Complete | Status | Completed |
|-------|------|--------------|------------------|----------------|--------|-----------|
| 5 - Custom Durations Core | Set and persist custom timer durations | DUR-01, DUR-02, DUR-03, DUR-05, DUR-06, DUR-08 | 6 criteria | 2/2 | Planning complete | - |
| 6 - Presets & Polish | Presets and confirmation dialogs | DUR-04, DUR-07, DUR-09 | 3 criteria | 0/1 | Not started | - |

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| DUR-01: Custom Focus duration (1-60 min) | Phase 5 | Pending |
| DUR-02: Custom Short Break duration (1-30 min) | Phase 5 | Pending |
| DUR-03: Custom Long Break duration (1-60 min) | Phase 5 | Pending |
| DUR-04: Preset duration options | Phase 6 | Pending |
| DUR-05: Duration validation bounds | Phase 5 | Pending |
| DUR-06: Duration persistence | Phase 5 | Pending |
| DUR-07: Confirmation when timer running | Phase 6 | Pending |
| DUR-08: Timer resets to new duration | Phase 5 | Pending |
| DUR-09: Reset to defaults | Phase 6 | Pending |

**Total:** 9/9 requirements mapped

---

*Roadmap for v1.1 Custom Durations*
*Created: 2026-02-19*
