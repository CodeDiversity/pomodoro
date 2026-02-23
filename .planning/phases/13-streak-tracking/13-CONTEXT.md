# Phase 13: Streak Tracking - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view their daily focus streaks (current and best) and view activity in a calendar heatmap. Streak increments only when user completes a focus session of at least 5 minutes on consecutive days. Users with 5+ day streaks can miss one day without losing their streak (streak protection). All data persists to IndexedDB.

</domain>

<decisions>
## Implementation Decisions

### Streak Display Location
- Current streak count displays in Stats view (primary location)
- Best (longest) streak displays below current streak in Stats view
- Streak counts update automatically after each completed focus session
- Use flame/fire icon next to current streak for visual appeal

### Calendar Heatmap
- Monthly grid layout showing current month by default
- Left/right navigation arrows to browse months
- Each day cell shows activity level via background color intensity
- Color coding: no sessions (gray/empty), 1-2 sessions (light blue), 3-4 sessions (medium blue), 5+ sessions (dark blue)
- Today highlighted with border
- Tooltip on hover shows exact session count and total duration for that day

### Streak Calculation
- Day boundary: midnight local time (user's timezone)
- A day counts as active if user completes at least one session of 5+ minutes
- Consecutive days: streak continues if activity occurs each calendar day
- Best streak: tracks highest consecutive day count ever achieved
- Streak recalculates on app load from session history

### Streak Protection
- Activates when current streak reaches 5+ days
- If user misses one day, streak pauses at current count instead of resetting to 0
- Protection can be used once per streak (not cumulative)
- Visual indicator shows when streak protection is active (shield icon)
- After using protection, next missed day resets streak normally

### Persistence
- Streak data stored in IndexedDB alongside session history
- Current streak, best streak, and protection status persisted
- Data loads on app initialization

### Claude's Discretion
- Exact icon designs and animations
- Calendar grid CSS/layout implementation
- Tooltip positioning and styling
- How to display "streak protection active" state visually
- Exact color hex values for heatmap levels

</decisions>

<specifics>
## Specific Ideas

- Streak display should feel motivational — consider subtle animation when streak increments
- Calendar should feel like GitHub contribution graph (familiar pattern)
- Stats view is the natural place for streaks (already shows weekly chart)

</specifics>

<deferred>
## Deferred Ideas

None — all decisions within Phase 13 scope.

</deferred>

---

*Phase: 13-streak-tracking*
*Context gathered: 2026-02-23*
