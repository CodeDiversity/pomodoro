# Pomodoro Timer + Session Notes + History

## What This Is

A responsive Pomodoro timer web app with session notes, history tracking, streak tracking, and stats. Built with React 18 + TypeScript + Vite, using IndexedDB for persistence. Features a modern light-mode aesthetic with blue accents, sidebar navigation, and split-pane timer view.

## Core Value

A focused productivity timer that helps users track work sessions with notes, and review their focus history over time—all without requiring a backend.

## Current Milestone: v2.3 (Complete)

**Shipped:** 2026-02-25

Rich text notes with bold, bullet lists, and clickable links now available in session notes and history.

---

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
- Weekly stats visualization (bar charts) — v2.1
- Custom notification sounds with volume control — v2.1
- Session title displayed in modal and history — v2.1
- Daily streak counter with calendar view — v2.2
- Export history as CSV — v2.2
- Import CSV files — v2.2
- Rich text editor with Bold, Bullet, Link toolbar buttons — v2.3
- Clickable URLs in session notes — v2.3
- Formatted notes in session summary modal — v2.3
- Formatted notes in history details drawer — v2.3

### Active

(None — start new milestone with `/gsd:new-milestone`)

---

## Context

- Tech stack: React 18, TypeScript, Vite, styled-components, Redux Toolkit
- Persistence: IndexedDB with versioned schema
- ~7,558 lines of TypeScript code
- v1.0 shipped: 2026-02-19
- v2.0 shipped: 2026-02-21
- v2.1 shipped: 2026-02-23
- v2.2 shipped: 2026-02-24
- v2.3 shipped: 2026-02-25

---

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite
- **Styling**: styled-components with centralized theme tokens
- **Persistence**: IndexedDB with versioned schema
- **State Management**: Redux Toolkit
- **Testing**: Vitest for pure function unit tests
- **Validation**: Note max 2000 chars, max 10 tags, each max 20 chars (alphanumeric + dash)
- **Duration Limits**: Focus 1-60 min, Short Break 1-30 min, Long Break 1-60 min

---

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
| Redux Toolkit migration | Centralized state with DevTools visibility | ✅ v2.1 |
| Custom persistence middleware | Control over IndexedDB sync with debouncing | ✅ v2.1 |
| Memoized selectors (createSelector) | Performance optimization for derived state | ✅ v2.1 |
| Chart.js for stats visualization | Lightweight bar charts with tooltips | ✅ v2.1 |
| Web Audio API for sounds | Programmatic sound generation with volume control | ✅ v2.1 |
| Streak Redux infrastructure | Centralized streak state with persistence | ✅ v2.2 |
| CSV export/import | Data portability for user sessions | ✅ v2.2 |
| Batch processing for large imports | Non-blocking UI during 1000+ session imports | ✅ v2.2 |

---

<details>
<summary><b>v2.2 Shipped (Archived)</b></summary>

## v2.2: Features (Shipped 2026-02-24)

**Goal:** Add daily streak tracking and data export/import capabilities

**Accomplishments:**
- Daily streak counter with calendar view
- Current and best streak tracking
- Streak protection (1 free miss for 5+ day streaks)
- CSV export from History view
- CSV import from Settings view
- Batch processing for large imports (50 sessions/batch)
- Duplicate detection via startTimestamp
- UI polish: consistent blue accent colors, spinner animation

**Key Changes:**
- Added streakSlice, streakMiddleware, streakStore
- Added CalendarHeatmap component
- Added csvExport.ts and csvImport.ts utilities
- Updated Settings.tsx with import functionality

**Tech Debt (minor, optional):**
- CSV import doesn't trigger streak recalculation immediately (works on next session)
- Session deletion doesn't trigger streak recalculation immediately
</details>

---

<details>
<summary><b>v2.3 Shipped (Archived)</b></summary>

## v2.3: Rich Text Notes (Shipped 2026-02-25)

**Goal:** Make session notes rich text — bold, bullet lists, clickable links with toolbar UI

**Accomplishments:**
- RichTextEditor component with TipTap and functional toolbar (Bold, Bullet, Link)
- RichTextDisplay component with DOMPurify sanitization for safe HTML rendering
- NotePanel integration: replaced textarea with RichTextEditor during active sessions
- SessionSummary modal displays formatted notes
- HistoryDrawer displays formatted notes in view mode
- Character counter with plain text length calculation
- Keyboard shortcuts (Cmd/Ctrl+B) for bold toggle
- Link security: target="_blank" with rel="noopener noreferrer"
- Text wrapping with word-break: break-all

**Key Changes:**
- Added @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link dependencies
- Added dompurify for XSS sanitization
- Created RichTextEditor.tsx and RichTextDisplay.tsx components
- Updated NotePanel.tsx, SessionSummary.tsx, HistoryDrawer.tsx

**Known Gaps (Tech Debt):**
- RTE-05: Toolbar buttons styling could be improved (functional, not fully styled)

**Key Decisions:**
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TipTap editor | Headless, React-friendly, extensible | ✅ v2.3 |
| DOMPurify for sanitization | Trusted, well-maintained XSS library | ✅ v2.3 |
| word-break: break-all | Force text wrapping in editor | ✅ v2.3 |
</details>

---

*Last updated: 2026-02-25 after v2.3 milestone completed*
