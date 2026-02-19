# Phase 1: Foundation - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

A working Pomodoro timer that counts down in MM:SS format, displays the current mode (Focus/Short Break/Long Break), persists state across page refreshes, and notifies users when sessions end. Users can start, pause, resume, skip, and reset the timer. Keyboard shortcuts (Space to toggle, Cmd+K for search) are available.

</domain>

<decisions>
## Implementation Decisions

### Timer Display
- MM:SS digital format (e.g., "25:00")
- Bold & prominent visual style — large numbers as the hero element
- Mode displayed with both text badge and color-coded background
- Session counter shown (e.g., "Session 2 of 4")

### Timer Controls
- Minimal visible controls: Play/Pause button only
- Other controls (Reset, Skip) in a menu
- Buttons use icons + text labels
- Keyboard shortcuts shown in a help panel (not on buttons)
- Skip advances directly to next session (Focus → Break or Break → Focus)

### Persistence
- Save: time remaining, current mode, session count, last active timestamp
- Storage: IndexedDB
- On corrupted data: reset to defaults
- Save frequency: every few seconds (balance accuracy and performance)

### Notifications
- Audio: system beep (no custom sound file needed)
- Browser notification permission: explicit prompt before first session
- Notification content: "Pomodoro Timer" as title, session type + encouragement in body
- Behavior: always notify, even when tab is in background

### Claude's Discretion
- Exact font choices and typography
- Color palette for mode indicators (user said "color coded")
- Help panel UI/UX details
- IndexedDB schema specifics

</decisions>

<specifics>
## Specific Ideas

- "Bold & prominent" — the timer should be the focal point
- "MM:SS digital" — classic digital clock look
- "Session counter" — users want to see progress through their pomodoro cycle

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-19*
