---
status: diagnosed
trigger: "NotePanel text area keeps expanding instead of wrapping text, and no red warning appears when 2000 character limit is reached"
created: "2026-02-24T22:00:00.000Z"
updated: "2026-02-24T22:10:00.000Z"
---

## Current Focus
hypothesis: "Root causes identified - text wrapping needs CSS fix, character counter compares HTML length instead of plain text"
test: "Code analysis complete"
expecting: "Ready to provide diagnosis and fixes"
next_action: "Provide root cause diagnosis"

## Symptoms
expected: "Text should wrap within the NotePanel editor, and character counter should turn red when 2000+ characters are entered"
actual: "Text keeps expanding (no wrapping), no red warning at 2000+ characters"
errors: "None reported"
reproduction: "User enters long text in NotePanel - text doesn't wrap, counter doesn't turn red"
started: "Unknown"

## Resolution

root_cause: |
  **Issue 1 (Text Wrapping):** The `.tiptap` editor in RichTextEditor.tsx lacks `word-wrap: break-word` CSS property. When users type long strings without spaces, the text expands horizontally instead of wrapping.

  **Issue 2 (Character Counter):** The character counter compares `noteText.length` which is HTML string length (includes tags like `<p>`, `<strong>`, etc.), not plain text length. Users may see the counter not turn red because HTML markup inflates the character count differently than visible text. Additionally, the comparison uses `>` instead of `>=`, so red only shows at 2001+ characters, not at 2000.

fix: |
  **Issue 1 Fix:** Add `word-wrap: break-word; overflow-wrap: break-word;` to the `.tiptap` CSS in EditorArea styled component (RichTextEditor.tsx lines 58-101).

  **Issue 2 Fix:**
  1. Strip HTML tags before counting characters: Use a regex or DOM parser to extract plain text from noteText
  2. Change `>` to `>=` in the comparison to trigger red at exactly 2000 characters

files_changed: []
  - src/components/RichTextEditor.tsx: Add word-wrap CSS to EditorArea
  - src/components/NotePanel.tsx: Calculate plain text length instead of HTML length

## Evidence

- timestamp: "2026-02-24T22:05:00.000Z"
  checked: "RichTextEditor.tsx EditorArea CSS (lines 58-101)"
  found: "No word-wrap or overflow-wrap CSS property in .tiptap styles"
  implication: "Long strings without spaces will expand horizontally"

- timestamp: "2026-02-24T22:06:00.000Z"
  checked: "NotePanel.tsx CharacterCount usage (line 391)"
  found: "Uses noteText.length directly - this is HTML string including tags"
  implication: "Character count includes HTML markup, not visible text"

- timestamp: "2026-02-24T22:07:00.000Z"
  checked: "NotePanel.tsx CharacterCount comparison (line 391)"
  found: "Uses > operator, not >= - only turns red at 2001+ chars"
  implication: "Red warning doesn't appear at exactly 2000 characters"