# Pomodoro Timer + Session Notes + History

## What This Is

A responsive Pomodoro timer web app with session notes, history tracking, and stats. Built with React 18 + TypeScript + Vite, using IndexedDB for persistence. Features a modern light-mode aesthetic with blue accents, sidebar navigation, and split-pane timer view.

## Core Value

A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## Current Milestone: v2.1 Enhancements

**Goal:** Add advanced features and architectural improvements: Redux Toolkit state management, enhanced stats visualizations, data export, and settings page modernization.

**Target features:**
- Redux Toolkit for centralized state management (refactor from useReducer)
- Modernized Settings page to match app design system
- Weekly stats visualization with bar charts
- Daily streak counter
- Export history as CSV
- Custom notification sounds
- Performance optimizations

## Requirements

### Validated

- Pomodoro timer with Focus/Short Break/Long Break modes — v1.0
- Session cycle: 4 focus → long break, else short break — v1.0
- Timer controls: Start, Pause, Resume, Skip, Reset — v1.0
- Display current mode and session count — v1.0
- Optional auto-start toggle for next session — v1.0
- Session notes during Focus sessions with autosave — v1.0
- Session records saved on session end (timestamp, duration, note, tags) — v1.0
- History screen with newest-first list — v1.0
- Details drawer for viewing/editing/deleting records — v1.0
- Filter by date range (today, 7 days, 30 days, all) — v1.0
- Text search across notes and tags — v1.0
- Stats: total focus time today, last 7 days, sessions today, longest session — v1.0
- Keyboard shortcuts: Space (start/pause), Enter (save note), Cmd+K (focus search) — v1.0
- Audible alert on session end — v1.0
- Browser notifications (if permitted) — v1.0
- Timer state persistence across refreshes — v1.0
- Customizable timer durations (1-60min focus, 1-30min short break, 1-60min long break) — v2.0
- Settings UI with real-time validation — v2.0
- Light mode aesthetic with blue accents — v2.0
- Sidebar navigation — v2.0
- Split-pane timer view with circular progress — v2.0
- Modal-based Settings and Help — v2.0
- Celebratory session completion UI — v2.0

### Active

- [ ] Weekly stats visualization (bar charts)
- [ ] Daily streak counter
- [ ] Export history as CSV
- [ ] Custom notification sounds

### Out of Scope

| Feature | Reason |
|---------|--------|
| Auth or cloud sync | Local-only app, no backend |
| Complex charting or analytics | Stats requirement is simple numbers only |
| Drag-and-drop functionality | Not needed |
| Mobile app | Web-only |
| OAuth or third-party integrations | Not needed |
| Sync across browser tabs | Not required |
| Custom session count before long break | Keep fixed at 4 for simplicity |

## Context

- Tech stack: React 18, TypeScript, Vite, styled-components
- Persistence: IndexedDB with versioned schema
- ~6,363 lines of TypeScript code
- v1.0 shipped: 2026-02-19
- v2.0 shipped: 2026-02-21

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite
- **Styling**: styled-components with centralized theme tokens
- **Persistence**: IndexedDB with versioned schema
- **State Management**: React hooks + useReducer for timer state
- **Testing**: Vitest for pure function unit tests
- **Validation**: Note max 2000 chars, max 10 tags, each max 20 chars (alphanumeric + dash)
- **Duration Limits**: Focus 1-60 min, Short Break 1-30 min, Long Break 1-60 min

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark mode UI | User preference — coding environment feel | ✅ v1.0, replaced in v2.0 |
| Tab-based navigation | Simple, familiar pattern | ✅ v1.0, replaced by sidebar in v2.0 |
| Gentle beep audio | Pleasant alert without jarring | ✅ v1.0, still active |
| useReducer for timer | Predictable state transitions | ✅ v1.0, still active |
| IndexedDB v1 schema | Simple versioning for migrations | ✅ v1.0, still active |
| Timestamp-based timer | Accurate timing across refreshes | ✅ v1.0, still active |
| Slide-out drawer | Non-blocking history details | ✅ v1.0, still active |
| Standard duration bounds | Industry-standard pomodoro ranges | ✅ v2.0 |
| Light mode with blue accents | Clean, professional aesthetic | ✅ v2.0 |
| Sidebar navigation | Better space utilization | ✅ v2.0 |
| Modal pattern for settings | Consistent UX, cleaner layout | ✅ v2.0 |
| Circular progress ring | Visual appeal, clear progress indication | ✅ v2.0 |
| Split-pane timer layout | Efficient use of screen real estate | ✅ v2.0 |

---

*Last updated: 2026-02-21 after v2.0 milestone completion*
