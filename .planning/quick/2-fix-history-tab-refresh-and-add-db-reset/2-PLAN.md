---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/services/sessionStore.ts
  - src/services/db.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "History tab automatically refreshes when user switches to it"
    - "User can reset all app data via Settings panel"
  artifacts:
    - path: "src/App.tsx"
      provides: "History tab auto-refresh on view change"
      min_lines: 10
    - path: "src/services/db.ts"
      provides: "Database reset function"
      exports: ["clearDatabase"]
    - path: "src/components/Settings.tsx"
      provides: "Reset button UI"
      contains: "Reset All Data"
---

<objective>
Fix history tab not refreshing when switching views, and add database reset functionality to Settings panel.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/services/db.ts
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionHistory.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add history tab auto-refresh</name>
  <files>src/App.tsx</files>
  <action>
Add a useEffect in App.tsx that calls refetch() when viewMode changes to 'history'. This ensures the history list refreshes whenever the user switches to the history tab.

The effect should be:
```tsx
// Refresh history when switching to history tab
useEffect(() => {
  if (viewMode === 'history') {
    refetch()
  }
}, [viewMode, refetch])
```
  </action>
  <verify>
After completing task, switching from Timer tab to History tab should fetch latest sessions from IndexedDB without page refresh.
  </verify>
  <done>
History tab shows newly created sessions immediately when switching to it
</done>
</task>

<task type="auto">
  <name>Task 2: Add database reset function</name>
  <files>src/services/db.ts</files>
  <action>
Add a clearDatabase function to db.ts that deletes all data from IndexedDB. This function should:
1. Delete all entries from 'sessions' store
2. Delete all entries from 'tags' store
3. Delete all entries from 'timerState' store
4. Delete all entries from 'settings' store

Export the function for use by Settings component.
  </action>
  <verify>
Function is exported and can be imported in other modules.
  </verify>
  <done>
clearDatabase function exists and is exported from db.ts
</done>
</task>

<task type="auto">
  <name>Task 3: Add Reset button to Settings panel</name>
  <files>src/components/Settings.tsx</files>
  <action>
Add a "Reset All Data" button to the Settings component that:
1. Imports clearDatabase from db.ts
2. Shows a confirmation dialog before resetting
3. Calls clearDatabase() and shows success message
4. Reloads the page after successful reset

Add a styled button at the bottom of the Settings panel with appropriate styling (red/danger color).
  </action>
  <verify>
Settings panel shows "Reset All Data" button, clicking it shows confirmation, and resetting clears IndexedDB.
  </verify>
  <done>
User can reset all app data from Settings panel with confirmation
</done>
</task>

</tasks>

<verification>
- History tab shows updated session list when switching from Timer tab
- Settings panel contains Reset All Data button
- Clicking Reset clears all IndexedDB data and reloads the app
</verification>

<success_criteria>
- History tab auto-refreshes on tab switch
- Database reset functionality works correctly
</success_criteria>

<output>
After completion, create .planning/quick/2-fix-history-tab-refresh-and-add-db-reset/2-SUMMARY.md
</output>
