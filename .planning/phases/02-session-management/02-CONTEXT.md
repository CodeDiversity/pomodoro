# Phase 2: Session Management - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can capture notes during focus sessions with automatic session recording. Notes input appears only during Focus mode (disabled during Break modes). Session records are saved with timestamps, duration, note content, and tags. Editing and deleting sessions is handled in Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Note Input UI
- **Placement:** Collapsible panel — toggle button reveals note area below timer
- **Input type:** Plain text — simple textarea, no formatting
- **Placeholder:** Open-ended — "Capture your thoughts..."
- **Autosave feedback:** Show save status — "Saving..." then "Saved" with timestamp

### Tag Input UX
- **Interface:** Chip/pill interface — type and press enter to create chips
- **Autocomplete:** Yes — show suggestions from previously used tags as user types
- **Removal:** Both methods — X button on chip AND keyboard backspace
- **Counter:** Show counter — "3/10 tags used" indicator

### Session Save Triggers
- **When to save:** Both — periodic checkpoints (every 5 min) AND at end of session
- **Manual save:** Manual save button available mid-session
- **Incomplete sessions:** Discard — if user resets or skips mid-session, don't save
- **Post-session flow:** Save & show summary — after session ends, show summary before continuing

### Session Data Structure
- **Timestamp:** Full timestamp — ISO timestamp + milliseconds
- **Additional fields:** All — completed status, mode type (focus/shortBreak/longBreak), start type (manual/auto)
- **Duration format:** Both — seconds as number AND MM:SS as string
- **ID:** Generate unique ID — timestamp-based or UUID

### Claude's Discretion
- Exact periodic checkpoint interval (default 5 minutes)
- Summary modal design and content
- Tag validation regex details
- Session storage format (IndexedDB schema)

</decisions>

<specifics>
## Specific Ideas

- Tags: alphanumeric + dash, max 20 chars each, max 10 per session
- Autosave debounce: 500ms (from success criteria)

</specifics>

<deferred>
## Deferred Ideas

- Editing sessions after recording — Phase 3
- Deleting sessions — Phase 3
- Viewing session history — Phase 3

</deferred>

---

*Phase: 02-session-management*
*Context gathered: 2026-02-19*
