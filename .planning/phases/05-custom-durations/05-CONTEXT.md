# Phase 5: Custom Durations Core - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can set and persist custom timer durations (Focus, Short Break, Long Break) that the timer uses. Settings UI expanded from existing Settings panel. This phase covers: data layer (persistence), timer integration, and Settings UI with duration inputs.

</domain>

<decisions>
## Implementation Decisions

### Input Style
- Number input with +/- stepper buttons
- User can both click +/- to adjust by 1 minute OR type directly
- Falls back to validation if direct typing produces invalid value

### Validation UX
- Real-time inline validation as user types
- Show error message below input when value is out of bounds
- Error message: "Must be between X and Y minutes"

### Apply Timing
- User must click "Apply" button to confirm changes
- Button shows "Apply" only (not "Apply & close")
- Panel stays open after clicking Apply

### Save Strategy
- Save to IndexedDB immediately when user clicks Apply
- Not debounced - immediate save on Apply click

### UI Location
- Expand existing Settings panel (dropdown from header)
- Add duration inputs below existing auto-start toggle

</decisions>

<specifics>
## Specific Ideas

- Duration inputs: Focus (1-60 min), Short Break (1-30 min), Long Break (1-60 min)
- Presets will be handled in Phase 6 (not in this phase)
- Default durations: Focus 25 min, Short Break 5 min, Long Break 15 min

</specifics>

<deferred>
## Deferred Ideas

- Preset duration buttons (Classic: 25/5/15, Extended: 50/10/30, Quick: 15/3/10) — Phase 6
- Confirmation dialog when timer is running — Phase 6
- Reset to defaults button — Phase 6

</deferred>

---

*Phase: 05-custom-durations*
*Context gathered: 2026-02-19*
