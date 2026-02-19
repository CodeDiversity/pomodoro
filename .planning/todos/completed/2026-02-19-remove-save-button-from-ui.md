---
created: 2026-02-19T18:59:03.822Z
title: Remove save button from UI
area: ui
files:
  - src/components/NotePanel.tsx:1
  - src/components/TimerControls.tsx:1
  - src/hooks/useSessionManager.ts:1
  - src/App.tsx:1
---

## Problem

The save button for session notes is unnecessary UI clutter. Notes autosave with 500ms debounce while typing, and sessions save automatically when completed. The manual save button adds no real value and clutters the interface.

## Solution

Remove the manual save button from the NotePanel or TimerControls. The autosave and automatic session save on timer completion make it redundant.

TBD - determine exact component and implementation approach during phase planning.
