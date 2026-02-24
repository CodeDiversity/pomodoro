---
phase: quick
plan: "12"
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "When user clicks Reset before timer completes, they get credit for actual time spent"
    - "Session is saved to history with partial duration, not discarded"
  artifacts:
    - path: src/App.tsx
      provides: "handleSessionReset saves session with partial credit"
      min_lines: 380
  key_links:
    - from: src/App.tsx (handleSessionReset)
      to: sessionManager.handleSessionSkip
      via: function call
      pattern: "handleSessionSkip"
---

<objective>
Allow users to get credit for partial sessions when they click Reset before the timer completes.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionManager.ts
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/TimerControls.tsx
</context>

<tasks>

<task type="auto">
  <name>Modify handleSessionReset to save partial session</name>
  <files>/Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx</files>
  <action>
Change handleSessionReset in App.tsx to save a session record with partial credit instead of discarding it. Currently at lines 385-387, it only calls sessionManager.handleSessionReset() which discards. Update it to call sessionManager.handleSessionSkip() instead, which will:
- Calculate actual duration based on time elapsed
- Save the session to IndexedDB with actualDurationSeconds
- Trigger the summary modal with the partial session data

This makes Reset behave like Skip (saving partial credit) rather than discarding the session entirely.
  </action>
  <verify>
<automated>npm run build 2>&1 | head -20</automated>
<manual>Start a timer, let it run for 10 seconds, then click Reset. Check History - session should appear with ~10 seconds of credit.</manual>
  </verify>
  <done>Clicking Reset before timer completes saves session with actual time elapsed, not full duration</done>
</task>

</tasks>

<verification>
- Build succeeds
- Start timer, let it run ~10 seconds, click Reset
- Verify session appears in History with actual duration (not full 25 minutes)
</verification>

<success_criteria>
Reset button now credits user for time actually spent, not full duration. Session saved to history with partial duration.
</success_criteria>

<output>
After completion, update quick task tracking in STATE.md
</output>
