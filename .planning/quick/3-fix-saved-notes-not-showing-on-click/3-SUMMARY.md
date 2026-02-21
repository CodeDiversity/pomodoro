---
phase: quick
plan: 3
subsystem: history
tags:
  - bug-fix
  - history-drawer
  - data-refresh
dependency_graph:
  requires:
    - HistoryDrawer component
    - useSessionHistory hook
  provides:
    - onSave callback prop
    - Refetch after note save
  affects:
    - Session history display
    - Note editing flow
tech_stack:
  added:
    - onSave callback prop pattern
  patterns:
    - Callback-based data refresh
key_files:
  created: []
  modified:
    - src/components/history/HistoryDrawer.tsx
    - src/App.tsx
decisions: []
metrics:
  duration: 2 min
  completed_date: 2026-02-21
---

# Quick Task 3: Fix Saved Notes Not Showing On Click Summary

## Overview

Fixed bug where saved notes would not show when clicking on a history session after editing.

## Problem

When a user edited a note in the history drawer and saved it (via 500ms debounced auto-save), clicking on the same session again would show stale data. This was because the sessions list in App.tsx was not being refreshed after the note was saved to IndexedDB.

## Solution

Added an `onSave` callback prop to the HistoryDrawer component that triggers a refetch of the sessions list in the parent App component after any note edit is saved.

### Changes Made

**1. src/components/history/HistoryDrawer.tsx**
- Added `onSave?: () => void` to `HistoryDrawerProps` interface
- Added `onSave` to component destructuring
- Added `onSave?.()` call after successful `saveSession` in the debounced save function

**2. src/App.tsx**
- Passed `onSave={refetch}` prop to HistoryDrawer component
- This ensures the sessions list refreshes after any note edit

## Verification

1. Open a session in history drawer
2. Edit the note and wait for auto-save (500ms)
3. Close the drawer
4. Click on the same session again
5. Verify the updated note is displayed (not stale data)

## Deviation

None - plan executed exactly as written.

## Self-Check

- [x] Build compiles successfully
- [x] Files modified as specified in plan
- [x] Commit created with proper format

## Self-Check: PASSED
