# Phase 3: History & Stats - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can review past focus sessions in a list view and view productivity statistics. This includes viewing session details, editing/deleting sessions, filtering by date range, searching notes/tags, and viewing stats. Navigation between Timer, History, and Stats tabs is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### History List Layout
- Display as compact list rows, not cards or grid
- Medium info density: date, duration, note preview (no time for each)
- Date format: Numeric (02/19/2026 2:30 PM)
- Tags shown as inline pills in each row
- Sort: Newest first (default)
- Empty state: Friendly message with CTA to start first session
- Pagination: Load more button (not infinite scroll)
- Duration format: Full words ("25 minutes", "1 hour 15 minutes")

### Details View
- Slide-out drawer from right (not modal overlay)
- Show all details: full note, timestamps, duration, tags, mode
- Editing: Auto-save as user types (no save button)
- Deletion: Confirm dialog before deleting

### Filtering & Search
- Date filters as clickable chips (not dropdown)
- Standard 4 options: Today, 7 days, 30 days, All
- Text search: Instant search as you type (searches notes and tags)
- Filters and search combine with AND logic (must match all)

### Stats Display
- Display as stat cards, not charts
- Show all 4 required metrics prominently:
  - Total focus time today
  - Total focus time last 7 days
  - Sessions today
  - Longest session in range
- Layout: 2x2 grid of stat cards
- Labels: Descriptive ("Today", "Last 7 Days", etc.)

### Claude's Discretion
- Exact styling of filter chips (colors, size)
- Loading skeleton design for history list
- Empty state illustration (if any)
- Stat card visual styling (icons, emphasis)

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel clean and simple, like a spreadsheet but prettier"
- List rows should be scannable at a glance
- Stats should be immediately visible without clicking anything

</specifics>

<deferred>
## Deferred Ideas

- Charts/graphs for stats — Phase 4 or future phase
- Export session data — future phase
- Sharing/stats visibility — future phase

</deferred>

---

*Phase: 03-history-stats*
*Context gathered: 2026-02-19*
