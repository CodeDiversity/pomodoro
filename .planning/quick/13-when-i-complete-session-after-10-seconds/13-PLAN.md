---
quick: 13
title: Fix session duration showing wrong time
tags: [bug-fix]
---

<objective>
Fix session duration calculation so partial sessions show actual elapsed time, not remaining time.
</objective>

<tasks>

<task type="auto">
<name>Fix duration calculation in useSessionManager.ts</name>
<files>src/hooks/useSessionManager.ts</files>
<action>
Change the actualDuration calculation from:
  `const actualDuration = params.duration - elapsedTime`
To:
  `const actualDuration = completed ? params.duration : elapsedTime`

This ensures partial sessions show elapsed time, not remaining time.
</action>
<verify>npm run build</verify>
<done>Session duration now correctly shows elapsed time for partial sessions</done>
</task>

</tasks>

<success_criteria>
- [x] Duration calculation fixed
- [x] Build passes
- [x] Manual test confirms fix
</success_criteria>
