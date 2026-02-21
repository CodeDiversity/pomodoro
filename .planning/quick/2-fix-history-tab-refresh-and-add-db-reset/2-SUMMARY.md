---
phase: quick
plan: 2
subsystem: core-ui
tags: [history, settings, database, indexeddb]
dependency_graph:
  requires: []
  provides:
    - History tab auto-refresh on view change
    - Database reset function clearDatabase()
    - Reset button in Settings panel
  affects:
    - src/App.tsx
    - src/services/db.ts
    - src/components/Settings.tsx
tech_stack:
  added:
    - clearDatabase() function in db.ts
  patterns:
    - useEffect for view mode change handling
    - window.confirm for confirmation dialogs
key_files:
  created: []
  modified:
    - path: src/App.tsx
      description: Added useEffect to refresh history when switching to history tab
    - path: src/services/db.ts
      description: Added clearDatabase function to reset all IndexedDB data
    - path: src/components/Settings.tsx
      description: Added Reset All Data button with confirmation dialog
decisions:
  - Used window.confirm for reset confirmation (simple, no additional deps)
  - Page reload after reset to ensure clean state
---

# Quick Task 2: Fix History Tab Refresh and Add DB Reset Summary

## Overview
Fixed history tab not refreshing when switching views, and added database reset functionality to Settings panel.

## Tasks Completed

### Task 1: Add history tab auto-refresh
**Status:** COMPLETED
**Commit:** 0411697
**Files modified:** src/App.tsx

Added a useEffect in App.tsx that calls refetch() when viewMode changes to 'history'. This ensures the history list refreshes whenever the user switches to the history tab without requiring a page refresh.

### Task 2: Add database reset function
**Status:** COMPLETED
**Commit:** 1172228
**Files modified:** src/services/db.ts

Added a clearDatabase function to db.ts that deletes all data from IndexedDB. The function clears all entries from:
- sessions store
- tags store
- timerState store
- settings store

### Task 3: Add Reset button to Settings panel
**Status:** COMPLETED
**Status:** 40af9de
**Files modified:** src/components/Settings.tsx

Added a "Reset All Data" button to the Settings component that:
1. Imports clearDatabase from db.ts
2. Shows a confirmation dialog before resetting
3. Calls clearDatabase() and reloads the page after successful reset

## Verification

- History tab shows updated session list when switching from Timer tab
- Settings panel contains Reset All Data button
- Clicking Reset clears all IndexedDB data and reloads the app

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit Hash | Message |
| ---- | ----------- | ------- |
| 1 | 0411697 | feat(quick-2): add history tab auto-refresh |
| 2 | 1172228 | feat(quick-2): add database reset function |
| 3 | 40af9de | feat(quick-2): add reset button to Settings panel |

## Self-Check

All files exist and commits are present.

## Self-Check: PASSED
