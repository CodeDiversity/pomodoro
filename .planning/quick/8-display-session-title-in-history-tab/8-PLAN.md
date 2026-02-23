---
phase: quick
plan: 8
type: execute
wave: 1
depends_on: []
files_modified: [src/components/history/HistoryItem.tsx]
autonomous: true
requirements: []
must_haves:
  truths:
    - "Sessions with taskTitle display the title in history"
    - "Sessions without taskTitle show 'Focus Session' as default"
  artifacts:
    - path: "src/components/history/HistoryItem.tsx"
      provides: "Session title display in history list"
      contains: "extractSessionTitle"
  key_links:
    - from: "HistoryItem.tsx"
      to: "SessionRecord.taskTitle"
      via: "extractSessionTitle function"
---

<objective>
Display the session title in the History tab. Currently it only shows "Focus Session" even when a task title was set.

Purpose: Users should see their task titles in their history for better context.
Output: Updated HistoryItem component showing taskTitle when available.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
# Project uses Redux with sessionSlice containing taskTitle field
# SessionRecord type has taskTitle: string
# useSessionManager saves taskTitle when session completes
# HistoryItem.tsx extractSessionTitle function doesn't check taskTitle
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update extractSessionTitle to use taskTitle</name>
  <files>src/components/history/HistoryItem.tsx</files>
  <action>
Update the extractSessionTitle function (lines 129-138) to check session.taskTitle first before falling back to noteText or 'Focus Session':

```typescript
function extractSessionTitle(session: SessionRecord): string {
  // First priority: taskTitle from session input
  if (session.taskTitle) {
    return truncateText(session.taskTitle, 50)
  }
  // Second priority: first line of noteText
  if (session.noteText) {
    const firstLine = session.noteText.split('\n')[0].trim()
    if (firstLine) {
      return truncateText(firstLine, 50)
    }
  }
  // Default fallback
  return 'Focus Session'
}
```
  </action>
  <verify>
Run build: `npm run build` should succeed with no errors
  </verify>
  <done>
Sessions with taskTitle display the taskTitle in history list. Sessions without taskTitle show 'Focus Session'.
  </done>
</task>

</tasks>

<verification>
- Build passes without errors
- TypeScript compiles successfully
</verification>

<success_criteria>
- History tab shows taskTitle when session has one
- History tab shows 'Focus Session' when no title is set
</success_criteria>

<output>
After completion, create .planning/quick/8-display-session-title-in-history-tab/8-SUMMARY.md
</output>
