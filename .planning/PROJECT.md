# Pomodoro Timer + Session Notes + History

## What This Is

A responsive Pomodoro timer web app with session notes, history tracking, and basic stats. Built with React 18 + TypeScript + Vite, using localStorage for persistence. Designed with dark mode aesthetic and tab-based navigation.

## Core Value

A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Pomodoro timer with Focus/Short Break/Long Break modes
- [ ] Session cycle: 4 focus → long break, else short break
- [ ] Timer controls: Start, Pause, Resume, Skip, Reset
- [ ] Display current mode and session count
- [ ] Optional auto-start toggle for next session
- [ ] Session notes during Focus sessions with autosave
- [ ] Session records saved on session end (timestamp, duration, note, tags)
- [ ] History screen with newest-first list
- [ ] Details drawer for viewing/editing/deleting records
- [ ] Filter by date range (today, 7 days, 30 days, all)
- [ ] Text search across notes and tags
- [ ] Stats: total focus time today, last 7 days, sessions today, longest session
- [ ] Keyboard shortcuts: Space (start/pause), Enter (save note), Cmd+K (focus search)
- [ ] Audible alert on session end
- [ ] Browser notifications (if permitted)
- [ ] Timer state persistence across refreshes

### Out of Scope

- Auth or cloud sync
- Complex charting or analytics
- Drag-and-drop functionality
- Mobile app (web-only)
- OAuth or third-party integrations

## Context

- Tech stack: React 18, TypeScript, Vite, styled-components
- No backend—localStorage only
- Minimal dependencies preferred
- Must feel like a desktop app on wide screens
- Unit tests for pure functions using Vitest

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite — modern, fast dev experience
- **Styling**: styled-components — minimal deps, component-scoped styles
- **Persistence**: localStorage with versioned schema + migration stub
- **State Management**: React hooks + useReducer for timer state
- **Testing**: Vitest for pure function unit tests
- **Validation**: Note max 2000 chars, max 10 tags, each max 20 chars (alphanumeric + dash)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark mode UI | User preference — coding environment feel | — Pending |
| Tab-based navigation | Simple, familiar pattern | — Pending |
| Gentle beep audio | Pleasant alert without jarring | — Pending |
| useReducer for timer | Predictable state transitions | — Pending |
| localStorage v1 schema | Simple versioning for future migrations | — Pending |

---
*Last updated: 2026-02-19 after initialization*
