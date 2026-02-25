---
phase: quick
plan: "16"
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "Reset modal shows actual time spent instead of hardcoded 25:00"
  artifacts:
    - path: "src/App.tsx"
      provides: "handleSessionReset function with elapsed time"
  key_links:
    - from: "handleSessionReset"
      to: "sessionManager.handleSessionSkip"
      via: "await"
      pattern: "record\\.durationString"
---

<objective>
Fix the reset session modal to show actual time spent instead of hardcoded "25:00"
</objective>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/STATE.md
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Fix handleSessionReset to show modal with elapsed time</name>
  <files>/Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx</files>
  <action>
Update the `handleSessionReset` function (around line 475) to:
1. Await the result from `sessionManager.handleSessionSkip()`
2. Use `record.durationString` (not hardcoded '25:00') to set completedSession
3. Dispatch showSummaryModal() to display the modal

This mirrors the correct pattern used in `handleSessionSkip` function (lines 460-472).
Also simplify the `onSessionSkip` callback in useSessionManager options (lines 424-434) to not show the modal - just do nothing since the modal is now properly handled by the calling functions.
  </action>
  <verify>
npm run build passes without errors
  </verify>
  <done>
Reset button now shows modal with actual time spent (e.g., "0:10") instead of "25:00"
  </done>
</task>

</tasks>

<verification>
Build succeeds. Manual verification: Start timer, wait ~10 seconds, click Reset. Modal should show actual time spent, not 25:00.
</verification>

<success_criteria>
- Build passes without errors
- Reset session modal displays elapsed time (e.g., "0:10") instead of hardcoded "25:00"
</success_criteria>

<output>
After completion, create .planning/quick/16-the-reset-session-modal-still-shows-25-m/16-SUMMARY.md
</output>
