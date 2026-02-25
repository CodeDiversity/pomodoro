---
status: diagnosed
phase: 22-polish-validation
source: 22-01-SUMMARY.md
started: 2026-02-25T00:00:00Z
updated: 2026-02-25T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Keyboard shortcut Cmd/Ctrl+B
expected: Start a focus session. In the NotePanel editor, type some text. Press Cmd+B (Mac) or Ctrl+B (Windows). The text should become bold. Press Cmd+B again to toggle bold off.
result: issue
reported: "fail, the bolding works, but it only turns bold AFTER you type first character"
severity: minor
root_cause: "Empty string initialization causes TipTap editor to lack proper selection, preventing keyboard shortcuts from working"
debug_session: ".planning/debug/keyboard-shortcut-bold-fix.md"

### 2. Links open in new tab with security
expected: Create a session with a link in the note. Complete the session to open the summary modal. Click the link - it should open in a new tab. Inspect the HTML to confirm rel="noopener noreferrer nofollow" is present.
result: pass

### 3. Legacy plain-text notes render correctly
expected: Load or create a session with plain text (no HTML formatting). View the session in the summary modal. Verify text displays as plain text (not raw HTML tags). Test edge case: text like "<b>test</b>" should be escaped and show as literal text.
result: pass

### 4. Character counter feedback
expected: Type text in the NotePanel. A character counter should appear showing current/max characters (e.g., "150 / 2000"). When approaching or exceeding 2000 characters, the counter should show red or indicate the limit.
result: issue
reported: "fail, for reason of text window just keeps expanding instead of wrapping also do not see red once 2000 is hit"
severity: minor
root_cause: "Text wrapping: missing word-wrap CSS. Character counter: compares HTML length instead of plain text, and uses > instead of >="
debug_session: ".planning/debug/note-panel-text-wrapping-issue.md"

### 5. End-to-end user flow
expected: |
  - Start focus session - timer starts, NotePanel visible
  - Type plain text - text appears in editor
  - Apply bold via toolbar button - text becomes bold
  - Apply bold via Cmd+B shortcut - text becomes bold
  - Remove bold via Cmd+B - bold removed
  - Apply bullet list - list created
  - Insert link - link appears, clickable, opens in new tab
  - Complete session - session saves, summary shows formatted text
  - View history - session shows in list
  - View session details - RichTextDisplay shows formatted notes
  - Edit note in history - switch to edit mode, modify, save
  - Open in new browser - all data persists correctly
result: pass

## Summary

total: 5
passed: 3
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Keyboard shortcut Cmd/Ctrl+B should toggle bold on selected text or at cursor position immediately"
  status: failed
  reason: "User reported: the bolding works, but it only turns bold AFTER you type first character"
  severity: minor
  test: 1
  root_cause: "Empty string initialization causes TipTap editor to lack proper selection, preventing keyboard shortcuts from working"
  artifacts:
    - path: "src/components/RichTextEditor.tsx"
      issue: "Line 153 passes empty string directly to TipTap useEditor"
  missing:
    - "Initialize TipTap with '<p></p>' instead of empty string when content is empty"
  debug_session: ".planning/debug/keyboard-shortcut-bold-fix.md"

- truth: "Character counter feedback with red warning at limit"
  status: failed
  reason: "User reported: text window just keeps expanding instead of wrapping also do not see red once 2000 is hit"
  severity: minor
  test: 4
  root_cause: "Text wrapping: missing word-wrap CSS. Character counter: compares HTML length instead of plain text, and uses > instead of >="
  artifacts:
    - path: "src/components/RichTextEditor.tsx"
      issue: "Missing word-wrap: break-word CSS in .tiptap styles"
    - path: "src/components/NotePanel.tsx"
      issue: "Line 391 uses noteText.length (HTML length) instead of plain text length, and uses > not >="
  missing:
    - "Add word-wrap: break-word CSS to editor"
    - "Calculate plain text length: noteText.replace(/<[^>]*>/g, '').length"
    - "Change > to >= in comparison"
  debug_session: ".planning/debug/note-panel-text-wrapping-issue.md"
