---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/TimerControls.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - Save button no longer appears in TimerControls
    - No manual save functionality in the UI
  artifacts:
    - path: src/App.tsx
      provides: TimerControls usage without save props
      contains: TimerControls
    - path: src/components/TimerControls.tsx
      provides: TimerControls component without save button
      contains: interface TimerControlsProps
  key_links: []
---

<objective>
Remove the manual save button from the UI. Notes autosave with 500ms debounce while typing, and sessions save automatically when completed. The manual save button is redundant UI clutter.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michaelrobert/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/App.tsx
@src/components/TimerControls.tsx
</context>

<tasks>

<task type="auto">
  <name>Remove save button from TimerControls usage in App.tsx</name>
  <files>src/App.tsx</files>
  <action>
    Remove the showManualSave and onManualSave props from TimerControls component usage:
    - Remove line: showManualSave={state.mode === 'focus' && state.isRunning}
    - Remove line: onManualSave={sessionManager.handleManualSave}

    The save button should no longer be rendered since these props are required to show it.
  </action>
  <verify>grep -n "showManualSave\|onManualSave" src/App.tsx returns no results</verify>
  <done>TimerControls in App.tsx no longer passes showManualSave or onManualSave props</done>
</task>

<task type="auto">
  <name>Clean up TimerControls.tsx by removing unused save props</name>
  <files>src/components/TimerControls.tsx</files>
  <action>
    Clean up TimerControls.tsx by removing the unused save-related props:
    - Remove showManualSave?: boolean from interface (line 14)
    - Remove onManualSave?: () => void from interface (line 15)
    - Remove showManualSave from destructured props (line 123)
    - Remove onManualSave from destructured props (line 124)
    - Remove the save button JSX block (lines 163-168): {showManualSave && onManualSave && (...)}
  </action>
  <verify>grep -n "showManualSave\|onManualSave" src/components/TimerControls.tsx returns no results</verify>
  <done>TimerControls component no longer accepts or renders save-related props</done>
</task>

</tasks>

<verification>
- App.tsx no longer imports or uses showManualSave/onManualSave
- TimerControls component no longer has save button logic
- Build passes without errors
</verification>

<success_criteria>
Save button is completely removed from the UI. The autosave (500ms debounce) and automatic session save on timer completion remain functional.
</success_criteria>

<output>
After completion, create .planning/quick/1-remove-save-button-from-ui/1-SUMMARY.md
</output>
