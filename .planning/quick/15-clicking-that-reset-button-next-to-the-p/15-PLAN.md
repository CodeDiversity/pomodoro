---
phase: quick
plan: "15"
type: execute
wave: 1
depends_on: []
files_modified:
  - /Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionManager.ts
autonomous: true
must_haves:
  truths:
    - "Clicking Reset saves partial session with elapsed time, not full duration"
    - "History shows actual time spent, not full session duration"
  artifacts:
    - path: "src/hooks/useSessionManager.ts"
      provides: "Session duration calculation"
      contains: "actualDuration"
  key_links:
    - from: "TimerControls.tsx (Reset button)"
      to: "useSessionManager.ts"
      via: "handleSessionReset -> handleSessionSkip -> createSessionRecord"
---

<objective>
Fix the reset button so it gives credit only for time spent, not full session duration.
</objective>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/quick/12-if-a-user-ends-a-session-before-25-minut/12-SUMMARY.md
@/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/quick/13-when-i-complete-session-after-10-seconds/13-SUMMARY.md
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionManager.ts
</context>

<tasks>

<task type="auto">
  <name>Debug: Add console.log to verify elapsed time calculation</name>
  <files>/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionManager.ts</files>
  <action>
Add a console.log in createSessionRecord to debug what's being calculated:
```typescript
const actualDuration = completed ? params.duration : Math.floor((now - startTime) / 1000)
console.log('createSessionRecord:', { completed, startTime, now, actualDuration, paramsDuration: params.duration })
```
Run the app, start timer, wait ~10 seconds, click Reset. Check console output.
  </action>
  <verify>
Console shows actualDuration matching elapsed time (~10 seconds), not 1500 (25 min)
</verify>
  <done>Debug output confirms actualDuration calculation is correct or identifies the bug</done>
</task>

<task type="auto">
  <name>Fix: Ensure elapsed time is used for partial sessions</name>
  <files>/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionManager.ts</files>
  <action>
If debug shows full duration being saved, fix the actualDuration calculation to always use elapsed time for incomplete sessions:
```typescript
const actualDuration = Math.floor((now - startTime) / 1000)
```
Remove the ternary - always calculate elapsed time. The completed flag only affects the `completed` field in the record, not the duration.
  </action>
  <verify>
Build passes. Start timer, wait 10 seconds, click Reset. Check History - session should show ~0:10, not 25:00.
</verify>
  <done>Reset button gives credit for time spent only</done>
</task>

</tasks>

<verification>
Manual test:
1. Start the timer (25:00)
2. Let it run for ~10-15 seconds
3. Click the Reset button (left button, circular arrow)
4. Go to History tab
5. Verify the new session shows elapsed time (~0:10 or ~0:15), NOT full 25:00
</verification>

<success_criteria>
- [ ] Clicking Reset saves session with actual elapsed time
- [ ] History shows partial duration, not full session
- [ ] Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/15-clicking-that-reset-button-next-to-the-p/15-SUMMARY.md`
</output>
