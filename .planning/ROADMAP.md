# Pomodoro Timer Roadmap

**Phase 1: Foundation**
- Goal: Users have a working, accurate Pomodoro timer that persists across refreshes
- Dependencies: None (foundation)
- Requirements: TMR-01 to TMR-12, NOTF-01 to NOTF-03, KEY-01 to KEY-03, DATA-01 to DATA-03
- Success Criteria (4):
  1. User sees timer counting down in MM:SS format with current mode displayed
  2. User can start, pause, resume, skip, and reset timer; after 4 focus sessions, timer auto-selects Long Break, otherwise Short Break
  3. Timer state persists across page refreshes (user can close and reopen browser, timer resumes from correct time)
  4. User hears audible beep and receives browser notification when session ends (if permitted)
  5. User can use Space to toggle start/pause, Cmd+K to focus search

**Phase 2: Session Management**
- Goal: Users can capture notes during focus sessions with automatic session recording
- Dependencies: Phase 1 (timer must work before sessions can be recorded)
- Requirements: SESS-01 to SESS-05, NOTE-01 to NOTE-05
- Success Criteria (4):
  1. User can enter and edit notes during Focus sessions with autosave (500ms debounce)
  2. User can add up to 10 tags per session (alphanumeric + dash, max 20 chars each)
  3. On Focus session end, session record is automatically saved with timestamps, duration, note, and tags
  4. Note input is disabled during Break modes

**Phase 3: History & Stats**
- Goal: Users can review past sessions and view productivity statistics
- Dependencies: Phase 2 (requires session data to exist)
- Requirements: HIST-01 to HIST-08, STAT-01 to STAT-04
- Success Criteria (5):
  1. User sees list of completed Focus sessions, newest first, with date/time, duration, note preview, and tags
  2. User can click a session to open details drawer showing full note, timestamps, and duration
  3. User can edit or delete session records from details view
  4. User can filter by date range (Today, 7 days, 30 days, All) and search by text in notes/tags
  5. User sees stats: total focus time today, total focus time last 7 days, sessions today, longest session in range

**Phase 4: Polish & Navigation**
- Goal: Users have a polished, navigable interface
- Dependencies: Phase 1 (navigation structure), Phase 3 (stats tab content)
- Requirements: NAV-01 to NAV-02
- Success Criteria (2):
  1. User can switch between Timer, History, and Stats tabs
  2. Active tab is visually indicated

---

## Progress Table

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 1 - Foundation | Working timer with persistence | TMR-01-12, NOTF-01-03, KEY-01-03, DATA-01-03 | Complete |
| 2 - Session Management | Notes and session recording | SESS-01-05, NOTE-01-05 | Complete |
| 3 - History & Stats | Review sessions and view stats | HIST-01-08, STAT-01-04 | Complete |
| 4 - Polish & Navigation | Tab navigation interface | NAV-01-02 | Pending |

---

## Phase 1 Plans

Plans:
- [x] 01-01-PLAN.md — Project Setup & Timer Core (Vite, types, useTimer hook, display)
- [x] 01-02-PLAN.md — Persistence & Notifications (IndexedDB, audio beep, browser notifications)
- [x] 01-03-PLAN.md — UI Components & Keyboard Shortcuts (controls, shortcuts, help panel)

---

## Phase 2 Plans

Plans:
- [x] 02-01-PLAN.md — IndexedDB Schema & Session Types (session types, extend db, session store)
- [x] 02-02-PLAN.md — Note Panel & Tag Input (NotePanel, TagInput, useSessionNotes with 500ms debounce)
- [x] 02-03-PLAN.md — Session Triggers & Integration (useSessionManager, SessionSummary, App integration)

---

## Phase 3 Plans

Plans:
- [x] 03-01-PLAN.md — History List UI (filters, list, drawer, hooks)
- [x] 03-02-PLAN.md — Stats Display (stats cards, calculations)
- [x] 03-03-PLAN.md — Integration (view toggle navigation)

---

## Coverage Summary

- Total v1 requirements: 38
- Mapped to phases: 38
- Unmapped: 0

**Phase Breakdown:**
- Phase 1: 21 requirements (Timer, Notifications, Keyboard, Data)
- Phase 2: 10 requirements (Sessions, Notes)
- Phase 3: 12 requirements (History, Stats)
- Phase 4: 2 requirements (Navigation)

---

*Roadmap created: 2026-02-19*
