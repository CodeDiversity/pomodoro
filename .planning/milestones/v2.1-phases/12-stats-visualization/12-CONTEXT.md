# Phase 12: Stats Visualization - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Weekly focus time visualization with bar charts showing last 7 days of focus sessions. Chart renders in Stats view with hover tooltips. Creating streak counter and export are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Chart Implementation
- Use Chart.js library (not custom SVG/CSS)
- Custom tooltips showing duration in readable format (e.g., "2h 15m")
- Bars animate from 0 to final height on initial render

### Layout & Placement
- Full-page Stats view (not sidebar widget)
- Chart appears with summary stats (today's time, weekly totals)
- Date range title above chart (e.g., "Feb 17 - Feb 23")
- Responsive resize on mobile (not horizontal scroll)

### Visual Styling
- Gradient bars: light blue (short duration) → dark blue (long duration)
- Days with zero focus time: minimal bar (small height, subtle)
- Bars have rounded top corners
- X-axis shows dates (e.g., "2/17", "2/18")

### Claude's Discretion
- Exact gradient color stops
- Animation duration and easing
- Summary stats的具体内容 (what metrics to show)

</decisions>

<specifics>
## Specific Ideas

- "Gradient by duration" — more focus time = darker blue
- Minimal bar for zero days — shows day exists but no activity

</specifics>

<deferred>
## Deferred Ideas

- Streak calendar view — Phase 13
- Interactive clicks on bars (future phase)

</deferred>

---

*Phase: 12-stats-visualization*
*Context gathered: 2026-02-23*
