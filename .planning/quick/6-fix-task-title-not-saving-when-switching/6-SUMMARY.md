---
phase: quick-06
plan: 01
subsystem: Session State
tags: [redux, persistence, session, bug-fix]
dependency_graph:
  requires: []
  provides:
    - taskTitle Redux state with setTaskTitle action
    - taskTitle persistence to IndexedDB
  affects:
    - NotePanel component
    - useSessionNotes hook
tech_stack:
  added:
    - taskTitle field in sessionSlice
    - taskTitle field in IndexedDB schema
  patterns:
    - Follows existing session note persistence pattern (500ms debounce)
    - Backward-compatible with existing component APIs
key_files:
  created: []
  modified:
    - src/features/session/sessionSlice.ts
    - src/features/session/sessionMiddleware.ts
    - src/services/persistence.ts
    - src/services/db.ts
    - src/hooks/useSessionNotes.ts
    - src/components/NotePanel.tsx
    - src/App.tsx
decisions:
  - Used existing 500ms debounce pattern from session notes persistence
  - taskTitle follows same saveStatus tracking as noteText/tags
metrics:
  duration: ""
  completed_date: 2026-02-23
  tasks_completed: 2
  files_modified: 7
---

# Quick Plan 6: Fix Task Title Not Saving When Switching Summary

## Overview
Fixed the bug where task title was not saved when switching tabs by connecting the "Current Task" input in NotePanel to Redux and persistence layer.

## One-Liner
Task title now persists when switching tabs and survives page refresh via IndexedDB

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add taskTitle to session Redux state and persistence | 0e1f849 | sessionSlice.ts, persistence.ts, db.ts, sessionMiddleware.ts |
| 2 | Wire NotePanel to Redux taskTitle | 0e1f849 | NotePanel.tsx, useSessionNotes.ts, App.tsx |

## Changes Made

### 1. sessionSlice.ts
- Added `taskTitle: string` to `SessionState` interface
- Added `taskTitle: ''` to initial state
- Added `setTaskTitle` reducer
- Updated `resetSession` to clear taskTitle
- Updated `loadSession` to restore taskTitle
- Exported `setTaskTitle` action

### 2. persistence.ts
- Updated `saveSessionState` to include `taskTitle` field
- Updated `loadSessionState` return type to include `taskTitle`

### 3. db.ts
- Added `taskTitle: string` to `SessionStateData` interface (IndexedDB schema)

### 4. sessionMiddleware.ts
- Added `session/setTaskTitle` to relevant actions list for persistence
- Updated save call to include `taskTitle`

### 5. useSessionNotes.ts
- Imported `setTaskTitle` from sessionSlice
- Added `taskTitle` to selector from Redux state
- Added `handleTaskTitleChange` callback
- Updated loadSession to include `taskTitle`
- Exported `taskTitle` and `handleTaskTitleChange` in return object

### 6. NotePanel.tsx
- Removed local `taskInput` state
- Added `taskTitle` and `onTaskTitleChange` to props interface
- Updated TaskInput to use props instead of local state

### 7. App.tsx
- Destructured `taskTitle` and `handleTaskTitleChange` from useSessionNotes
- Passed props to NotePanel component

## Verification

Build passes:
```
npm run build
```

## Deviations from Plan

None - plan executed exactly as written.

## Auth Gates

None.

## Self-Check

- [x] Build passes (npm run build)
- [x] All files modified exist
- [x] Commit created (0e1f849)
