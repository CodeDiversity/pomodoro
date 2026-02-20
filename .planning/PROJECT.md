# Pomodoro Timer + Session Notes + History

## What This Is

A responsive Pomodoro timer web app with session notes, history tracking, and basic stats. Built with React 18 + TypeScript + Vite, using IndexedDB for persistence. Designed with dark mode aesthetic and tab-based navigation.

## Core Value

A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## Requirements

### Validated

- ✅ Pomodoro timer with Focus/Short Break/Long Break modes — v1.0
- ✅ Session cycle: 4 focus → long break, else short break — v1.0
- ✅ Timer controls: Start, Pause, Resume, Skip, Reset — v1.0
- ✅ Display current mode and session count — v1.0
- ✅ Optional auto-start toggle for next session — v1.0
- ✅ Session notes during Focus sessions with autosave — v1.0
- ✅ Session records saved on session end (timestamp, duration, note, tags) — v1.0
- ✅ History screen with newest-first list — v1.0
- ✅ Details drawer for viewing/editing/deleting records — v1.0
- ✅ Filter by date range (today, 7 days, 30 days, all) — v1.0
- ✅ Text search across notes and tags — v1.0
- ✅ Stats: total focus time today, last 7 days, sessions today, longest session — v1.0
- ✅ Keyboard shortcuts: Space (start/pause), Enter (save note), Cmd+K (focus search) — v1.0
- ✅ Audible alert on session end — v1.0
- ✅ Browser notifications (if permitted) — v1.0
- ✅ Timer state persistence across refreshes — v1.0

### Active

(None yet — next milestone not planned)

### Out of Scope

| Feature | Reason |
|---------|--------|
| Auth or cloud sync | Local-only app, no backend |
| Complex charting or analytics | Stats requirement is simple numbers only |
| Drag-and-drop functionality | Not needed |
| Mobile app | Web-only |
| OAuth or third-party integrations | Not needed |

## Context

- Tech stack: React 18, TypeScript, Vite, styled-components
- Persistence: IndexedDB with versioned schema
- ~3,800 lines of code (TypeScript + CSS)
- v1.0 shipped: 2026-02-19

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite — modern, fast dev experience
- **Styling**: styled-components — minimal deps, component-scoped styles
- **Persistence**: IndexedDB with versioned schema + migration stub
- **State Management**: React hooks + useReducer for timer state
- **Testing**: Vitest for pure function unit tests
- **Validation**: Note max 2000 chars, max 10 tags, each max 20 chars (alphanumeric + dash)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark mode UI | User preference — coding environment feel | ✅ Shipped in v1.0 |
| Tab-based navigation | Simple, familiar pattern | ✅ Shipped in v1.0 |
| Gentle beep audio | Pleasant alert without jarring | ✅ Shipped in v1.0 |
| useReducer for timer | Predictable state transitions | ✅ Shipped in v1.0 |
| IndexedDB v1 schema | Simple versioning for future migrations | ✅ Shipped in v1.0 |
| Timestamp-based timer | Accurate timing across refreshes | ✅ Shipped in v1.0 |
| Slide-out drawer | Non-blocking history details | ✅ Shipped in v1.0 |

---

*Last updated: 2026-02-19 after v1.0 milestone*
