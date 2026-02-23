---
phase: 6-fix-task-title-not-saving-when-switching
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/session/sessionSlice.ts
  - src/services/persistence.ts
  - src/hooks/useSessionNotes.ts
  - src/components/NotePanel.tsx
  - src/App.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "User can type a task title and it persists when switching tabs"
    - "Task title loads from IndexedDB when app starts"
  artifacts:
    - path: "src/features/session/sessionSlice.ts"
      provides: "Redux state for taskTitle with setTaskTitle action"
    - path: "src/services/persistence.ts"
      provides: "saveSessionState and loadSessionState include taskTitle"
    - path: "src/components/NotePanel.tsx"
      provides: "TaskInput uses Redux taskTitle, not local state"
  key_links:
    - from: "NotePanel.tsx"
      to: "sessionSlice.ts"
      via: "useSessionNotes hook"
      pattern: "taskTitle"
---

<objective>
Fix the bug where task title is not saved when switching tabs.

Purpose: Connect the "Current Task" input in NotePanel to Redux and persistence layer so it survives tab switches.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michaelrobert/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/features/session/sessionSlice.ts
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/services/persistence.ts
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionNotes.ts
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/NotePanel.tsx
</context>

<tasks>

<task type="auto">
  <name>Add taskTitle to session Redux state and persistence</name>
  <files>src/features/session/sessionSlice.ts, src/services/persistence.ts</files>
  <action>
    1. In sessionSlice.ts: Add taskTitle: string to SessionState interface, add to initialState as '', add setTaskTitle reducer, update resetSession and loadSession to handle taskTitle, export setTaskTitle
    2. In persistence.ts: Update saveSessionState and loadSessionState to include taskTitle field in IndexedDB
  </action>
  <verify>Build passes: npm run build</verify>
  <done>sessionSlice exports setTaskTitle, persistence saves/loads taskTitle</done>
</task>

<task type="auto">
  <name>Wire NotePanel to Redux taskTitle</name>
  <files>src/hooks/useSessionNotes.ts, src/components/NotePanel.tsx, src/App.tsx</files>
  <action>
    1. In useSessionNotes.ts: Import setTaskTitle, add taskTitle to selector, add handleTaskTitleChange callback, export both in return
    2. In NotePanel.tsx: Remove local taskInput state, add taskTitle/onTaskTitleChange to props, update TaskInput to use props
    3. In App.tsx: Destructure taskTitle and handleTaskTitleChange from useSessionNotes, pass to NotePanel
  </action>
  <verify>Build passes: npm run build</verify>
  <done>TaskInput uses Redux state, persists across tab switches</done>
</task>

</tasks>

<verification>
Run the app, type in the "Current Task" field, switch to History tab, switch back to Timer tab - the task title should still be there.
</verification>

<success_criteria>
Task title persists when switching between tabs and survives page refresh (via IndexedDB).
</success_criteria>

<output>
After completion, create `.planning/quick/6-fix-task-title-not-saving-when-switching/6-01-SUMMARY.md`
</output>
