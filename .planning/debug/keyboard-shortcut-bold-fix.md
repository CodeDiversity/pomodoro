---
status: resolved
trigger: "Cmd/Ctrl+B bold shortcut only works AFTER typing the first character"
created: "2026-02-24T21:45:00.000Z"
updated: "2026-02-24T21:50:00.000Z"
---

## Current Focus
root_cause: Empty string initialization causes TipTap editor to lack proper selection, preventing keyboard shortcuts from working

## Symptoms
expected: Cmd+B should toggle bold immediately at cursor position
actual: Cmd+B only works AFTER typing at least one character
errors: None - silent failure
reproduction: Open editor with empty content, press Cmd+B - nothing happens. Type a character, then Cmd+B - bold works.
started: Unknown (existing behavior)

## Resolution

root_cause: |
  When TipTap receives an empty string (`''`) as content, it initializes an empty document without a proper selection position. The built-in keyboard shortcuts (like Cmd+B) require a valid selection to apply formatting. After typing a character, there's content AND a proper selection, so shortcuts work.

fix: |
  Initialize TipTap with an empty paragraph `<p></p>` instead of an empty string. This ensures there's always a valid document node with a cursor position, allowing keyboard shortcuts to work immediately.

verification: |
  Tested by modifying RichTextEditor.tsx to use content || '<p></p>' instead of just content. Cmd+B now works on empty editor.

files_changed:
  - src/components/RichTextEditor.tsx (line 153): Change `content` to `content || '<p></p>'`

## Evidence

- timestamp: "2026-02-24T21:46:00.000Z"
  checked: sessionSlice.ts initial state
  found: noteText is initialized as empty string ''
  implication: Empty string passed to TipTap editor

- timestamp: "2026-02-24T21:47:00.000Z"
  checked: RichTextEditor.tsx useEditor configuration
  found: content prop passed directly to TipTap (line 153)
  implication: No handling for empty content case

- timestamp: "2026-02-24T21:48:00.000Z"
  checked: TipTap behavior with empty content
  found: Empty string creates empty document without selection
  implication: Keyboard shortcuts require selection to apply formatting

- timestamp: "2026-02-24T21:49:00.000Z"
  checked: TipTap documentation patterns
  found: Common solution is to use default empty paragraph
  implication: Fix is to provide empty paragraph when content is empty
