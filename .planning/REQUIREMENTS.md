# Requirements: Pomodoro Timer + Session Notes + History

**Defined:** 2026-02-19
**Core Value:** A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## v1 Requirements

### Timer

- [ ] **TMR-01**: Timer displays time in MM:SS format
- [ ] **TMR-02**: Timer supports three modes: Focus (25:00), Short Break (5:00), Long Break (15:00)
- [ ] **TMR-03**: After 4 focus sessions, auto-select Long Break; otherwise Short Break
- [ ] **TMR-04**: Start control begins countdown
- [ ] **TMR-05**: Pause control stops countdown temporarily
- [ ] **TMR-06**: Resume control continues from paused time
- [ ] **TMR-07**: Skip control ends current session early and moves to next
- [ ] **TMR-08**: Reset control returns to initial duration for current mode
- [ ] **TMR-09**: Display shows current mode (Focus/Short Break/Long Break)
- [ ] **TMR-10**: Display shows session count (e.g., "Focus #2")
- [ ] **TMR-11**: Auto-start toggle option (off by default) starts next session automatically
- [ ] **TMR-12**: Timer persists running state across page refresh (store lastTick timestamp)

### Notifications

- [ ] **NOTF-01**: Play audible beep when session ends
- [ ] **NOTF-02**: Request browser notification permission on first interaction
- [ ] **NOTF-03**: Send browser notification when session ends (if permitted)

### Session Notes

- [x] **NOTE-01**: Text input available during Focus sessions only
- [x] **NOTE-02**: Notes autosave while timer runs (debounced, 500ms)
- [x] **NOTE-03**: Note maximum length: 2000 characters
- [x] **NOTE-04**: Tags input allows comma-separated tags
- [x] **NOTE-05**: Maximum 10 tags, each max 20 characters, alphanumeric + dash only

### Session Records

- [ ] **SESS-01**: On Focus session end (timer hits 0 or Skip), save session record
- [x] **SESS-02**: Session record includes: id (uuid), start timestamp, end timestamp
- [x] **SESS-03**: Session record includes: planned duration seconds, actual duration seconds
- [x] **SESS-04**: Session record includes: mode (Focus only for history)
- [x] **SESS-05**: Session record includes: note text, tags array

### History

- [ ] **HIST-01**: History displays list of Focus session records, newest first
- [ ] **HIST-02**: Each item shows: date/time, actual duration, note preview (truncated), tags
- [ ] **HIST-03**: Click item opens details drawer/modal
- [ ] **HIST-04**: Details show: full note, start/end timestamps, duration
- [ ] **HIST-05**: Details allow editing note and tags
- [ ] **HIST-06**: Details allow deleting record
- [ ] **HIST-07**: Filter by date range: Today, Last 7 days, Last 30 days, All
- [ ] **HIST-08**: Search input filters by text in notes and tags

### Stats

- [ ] **STAT-01**: Display total focus time today
- [ ] **STAT-02**: Display total focus time last 7 days
- [ ] **STAT-03**: Display number of focus sessions today
- [ ] **STAT-04**: Display longest focus session in selected range

### Keyboard Shortcuts

- [ ] **KEY-01**: Space key toggles Start/Pause/Resume
- [ ] **KEY-02**: Enter key saves note when focus is on note field (prevent form submit)
- [ ] **KEY-03**: Cmd/Ctrl+K focuses search box in history

### Navigation

- [ ] **NAV-01**: Tab-based navigation: Timer | History | Stats
- [ ] **NAV-02**: Active tab visually indicated

### Data Persistence

- [ ] **DATA-01**: localStorage schema with version number
- [ ] **DATA-02**: Migration stub for future schema changes
- [ ] **DATA-03**: Settings stored: durations, auto-start preference

## v2 Requirements

### Timer

- **TMR-13**: Customizable durations in settings

### Notifications

- **NOTF-04**: Customizable notification sound

### History

- **HIST-09**: Export history as CSV

### Stats

- **STAT-05**: Weekly bar chart visualization
- **STAT-06**: Daily streak counter

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auth or cloud sync | Local-only app, no backend |
| Mobile app | Web-only, responsive design |
| OAuth or third-party login | Not needed for personal use |
| Team/multi-user features | Beyond MVP scope |
| Complex charting | Stats requirement is simple numbers only |
| Drag-and-drop | Not needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TMR-01 | Phase 1 | Pending |
| TMR-02 | Phase 1 | Pending |
| TMR-03 | Phase 1 | Pending |
| TMR-04 | Phase 1 | Pending |
| TMR-05 | Phase 1 | Pending |
| TMR-06 | Phase 1 | Pending |
| TMR-07 | Phase 1 | Pending |
| TMR-08 | Phase 1 | Pending |
| TMR-09 | Phase 1 | Pending |
| TMR-10 | Phase 1 | Pending |
| TMR-11 | Phase 1 | Pending |
| TMR-12 | Phase 1 | Pending |
| NOTF-01 | Phase 1 | Pending |
| NOTF-02 | Phase 1 | Pending |
| NOTF-03 | Phase 1 | Pending |
| KEY-01 | Phase 1 | Pending |
| KEY-02 | Phase 1 | Pending |
| KEY-03 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| SESS-01 | Phase 2 | Pending |
| SESS-02 | Phase 2 | Complete |
| SESS-03 | Phase 2 | Complete |
| SESS-04 | Phase 2 | Complete |
| SESS-05 | Phase 2 | Complete |
| NOTE-01 | Phase 2 | Complete |
| NOTE-02 | Phase 2 | Complete |
| NOTE-03 | Phase 2 | Complete |
| NOTE-04 | Phase 2 | Complete |
| NOTE-05 | Phase 2 | Complete |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| HIST-03 | Phase 3 | Pending |
| HIST-04 | Phase 3 | Pending |
| HIST-05 | Phase 3 | Pending |
| HIST-06 | Phase 3 | Pending |
| HIST-07 | Phase 3 | Pending |
| HIST-08 | Phase 3 | Pending |
| STAT-01 | Phase 3 | Pending |
| STAT-02 | Phase 3 | Pending |
| STAT-03 | Phase 3 | Pending |
| STAT-04 | Phase 3 | Pending |
| NAV-01 | Phase 4 | Pending |
| NAV-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after roadmap creation*
