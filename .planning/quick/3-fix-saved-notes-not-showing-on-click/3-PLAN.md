---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/history/HistoryDrawer.tsx
  - src/App.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "User can see saved notes when clicking on a history session"
    - "Edited notes persist after closing and reopening the drawer"
  artifacts:
    - path: "src/components/history/HistoryDrawer.tsx"
      provides: "Session detail drawer with note editing"
      contains: "onSave prop to trigger refetch"
    - path: "src/App.tsx"
      provides: "Main app with history session handling"
      contains: "refetch passed to HistoryDrawer onSave"
  key_links:
    - from: "HistoryDrawer.tsx"
      to: "App.tsx"
      via: "onSave callback prop"
      pattern: "onSave.*refetch"
---

<objective>
Fix saved notes not showing when clicking on history sessions.

Purpose: After editing and saving a note in the history drawer, clicking on the same session should show the updated note, not stale data.
Output: Working note display with proper data refresh
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michaelrobert/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/history/HistoryDrawer.tsx
@src/App.tsx

The bug: HistoryDrawer saves notes to IndexedDB but doesn't trigger a refetch of the sessions list in App.tsx. This causes stale data when clicking on a session again after editing.
</context>

<tasks>

<task type="auto">
  <name>Add onSave callback to HistoryDrawer</name>
  <files>src/components/history/HistoryDrawer.tsx</files>
  <action>
    1. Add `onSave?: () => void` prop to HistoryDrawerProps interface
    2. After successful save in debouncedSave (line 252 after `await saveSession`), call `onSave?.()` to trigger parent refetch
    3. Pass `onSave` prop in the component destructuring
  </action>
  <verify>HistoryDrawer now accepts and calls onSave callback after saving</verify>
  <done>HistoryDrawer has onSave prop that fires after note save completes</done>
</task>

<task type="auto">
  <name>Wire onSave to refetch in App.tsx</name>
  <files>src/App.tsx</files>
  <action>
    1. Find HistoryDrawer usage (around line 377)
    2. Add `onSave={refetch}` prop to the HistoryDrawer component
    3. This ensures sessions list refreshes after any note edit in the drawer
  </action>
  <verify>App.tsx passes refetch to HistoryDrawer's onSave prop</verify>
  <done>Clicking a session after editing shows updated note data</done>
</task>

</tasks>

<verification>
1. Open a session in history drawer
2. Edit the note and wait for auto-save
3. Close the drawer
4. Click on the same session again
5. Verify the updated note is displayed (not stale data)
</verification>

<success_criteria>
- Notes saved in history drawer persist correctly
- Reopening the same session shows updated note content
- No console errors during save/load cycle
</success_criteria>

<output>
After completion, create `.planning/quick/3-fix-saved-notes-not-showing-on-click/3-SUMMARY.md`
</output>
