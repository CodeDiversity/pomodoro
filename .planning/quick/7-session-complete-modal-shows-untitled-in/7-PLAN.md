---
phase: quick
plan: 7
type: execute
wave: 1
depends_on: []
files_modified:
  - src/types/session.ts
  - src/App.tsx
  - src/hooks/useSessionManager.ts
  - src/components/SessionSummary.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Session complete modal shows the typed task title, not 'Untitled Session'"
  artifacts:
    - path: "src/types/session.ts"
      provides: "Add taskTitle to SessionNoteState and SessionRecord types"
    - path: "src/App.tsx"
      provides: "Pass taskTitle to useSessionManager and SessionSummary"
    - path: "src/hooks/useSessionManager.ts"
      provides: "Include taskTitle in session record"
    - path: "src/components/SessionSummary.tsx"
      provides: "Display taskTitle from session data"
  key_links:
    - from: "src/components/SessionSummary.tsx"
      to: "taskTitle in session props"
      via: "Display taskTitle instead of extracting from noteText"
---

<objective>
Fix session complete modal to display the typed task title instead of "Untitled Session"

Purpose: Users enter a task title in the "Current Task" field, but this isn't being passed through to the session summary modal

Output: Modal correctly shows typed task title
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/types/session.ts (SessionNoteState and SessionRecord need taskTitle)
@src/hooks/useSessionManager.ts (line 53: noteText saved without taskTitle)
@src/components/SessionSummary.tsx (lines 173-177: extracts title from noteText)
@src/App.tsx (line 315: noteState missing taskTitle)
</context>

<tasks>

<task type="auto">
  <name>Add taskTitle to session types</name>
  <files>src/types/session.ts</files>
  <action>
Add taskTitle field to both interfaces:
1. SessionNoteState: add taskTitle: string
2. SessionRecord: add taskTitle: string
  </action>
  <verify>Build succeeds with no TypeScript errors</verify>
  <done>Types include taskTitle field</done>
</task>

<task type="auto">
  <name>Add taskTitle to noteState in App.tsx</name>
  <files>src/App.tsx</files>
  <action>
Include taskTitle in the noteState object passed to useSessionManager. Currently noteState is:
  const noteState = { noteText, tags, lastSaved, saveStatus }
Change to:
  const noteState = { noteText, tags, taskTitle, lastSaved, saveStatus }

Also pass taskTitle to SessionSummary by adding taskTitle to completedSession state object.
  </action>
  <verify>Build succeeds with no TypeScript errors</verify>
  <done>App.tsx passes taskTitle through the session flow</done>
</task>

<task type="auto">
  <name>Include taskTitle in session record</name>
  <files>src/hooks/useSessionManager.ts</files>
  <action>
Add taskTitle to the session record created in createSessionRecord function (around line 53):
  taskTitle: params.noteState.taskTitle,
  </action>
  <verify>Build succeeds with no TypeScript errors</verify>
  <done>Session records now include taskTitle field</done>
</task>

<task type="auto">
  <name>Display taskTitle in SessionSummary</name>
  <files>src/components/SessionSummary.tsx</files>
  <action>
Update SessionSummaryProps interface to include taskTitle field, then modify getTitle function to return taskTitle when available:
  const getTitle = () => {
    if (session.taskTitle) return session.taskTitle
    if (!session.noteText) return 'Untitled Session'
    const firstLine = session.noteText.split('\n')[0].trim()
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
  }
  </action>
  <verify>Build succeeds with no TypeScript errors</verify>
  <done>SessionSummary displays taskTitle when provided</done>
</task>

</tasks>

<verification>
- Build succeeds without errors
- TypeScript compiles without errors
</verification>

<success_criteria>
When a user types a task title (e.g., "Fix login bug") and completes a session, the session complete modal shows "Fix login bug" as the task, not "Untitled Session"
</success_criteria>

<output>
After completion, create `.planning/quick/7-session-complete-modal-shows-untitled-in/quick-07-SUMMARY.md`
</output>
