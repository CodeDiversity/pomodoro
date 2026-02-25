# Phase 22: Polish & Validation - Research

**Researched:** 2026-02-24
**Domain:** Final Integration Verification, Keyboard Shortcuts, Edge Case Handling
**Confidence:** HIGH

## Summary

Phase 22 addresses the final integration verification, keyboard shortcuts, and edge case handling for the v2.3 Rich Text Notes feature. This phase ensures all features work correctly together, validates keyboard accessibility, handles legacy data, and confirms proper security attributes on links.

**Primary recommendation:** Verify Tiptap's built-in keyboard shortcuts work, ensure link security attributes are applied in display mode, validate character limit works correctly with HTML content, and perform browser testing to confirm all v2.3 features function end-to-end.

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RTE-01 | User can toggle bold formatting via toolbar button | Already implemented - toolbar button exists in RichTextEditor |
| RTE-04 | Rich text editor replaces textarea in NotePanel during active session | Already implemented - Phase 20 integrated RichTextEditor |
| RTE-05 | Toolbar buttons (Bold, Bullet, Link) are functional and styled | Already implemented - toolbar buttons work |
| RTD-01 through RTD-06 | Rich text display in modal and drawer | Already implemented - Phase 21 integrated RichTextDisplay |
| INF-01 | Rich text display components sanitize HTML to prevent XSS | Already implemented - DOMPurify in Phase 18 |
| INF-02 | Existing plain-text notes render correctly without formatting | Already implemented - isRichText detection in sanitize.ts |
| INF-03 | Session notes autosave preserves rich text formatting | Already implemented - onChange callback passes HTML |

</phase_requirements>

## Success Criteria to Verify

| # | Criteria | Verification Method |
|---|----------|-------------------|
| 1 | Cmd/Ctrl+B keyboard shortcut toggles bold in editor | Manual browser test - start focus session, type text, press Cmd+B |
| 2 | Links rendered in modal open in new tab with proper security attributes | Code review - check if target="_blank" and rel="noopener noreferrer" applied |
| 3 | Legacy plain-text notes (pre-v2.3) render without HTML artifacts | Manual test - load old note data, verify it displays as plain text |
| 4 | Character limit validation works correctly with HTML content | Code review + manual test - verify 2000 char limit works with HTML |
| 5 | All v2.3 features functional in a clean browser test | End-to-end testing in fresh browser |

---

## What's Already Implemented

### Phase 18 (Infrastructure)
- `src/utils/sanitize.ts` - DOMPurify sanitization with strict allowlist
- `src/components/RichTextDisplay.tsx` - Read-only rendering with XSS protection

### Phase 19 (Editor Component)
- `src/components/RichTextEditor.tsx` - Tiptap-based rich text editor with toolbar

### Phase 20 (NotePanel Integration)
- RichTextEditor integrated into NotePanel
- Bold, Bullet List, Link toolbar buttons functional

### Phase 21 (Read-Only Display)
- RichTextDisplay integrated into SessionSummary modal
- RichTextDisplay integrated into HistoryDrawer (with edit/view toggle)

---

## Key Technical Details

### 1. Keyboard Shortcuts (Cmd/Ctrl+B)

**Current State:** Tiptap's StarterKit includes keyboard shortcuts by default. The `toggleBold()` command is bound to Cmd+B (Mac) / Ctrl+B (Windows) automatically.

**Implementation in RichTextEditor.tsx:**
```typescript
// Tiptap StarterKit includes bold shortcut by default
// No additional keyboard event handlers needed
```

**Verification Needed:**
- [ ] Verify Cmd+B works in the editor when typing text
- [ ] Verify the bold formatting is applied correctly
- [ ] Verify Cmd+B toggles bold off when text is already bold

### 2. Link Security Attributes

**Current State:** The RichTextEditor configures link security:
```typescript
// RichTextEditor.tsx lines 145-150
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    rel: 'noopener noreferrer nofollow',
  },
})
```

**Issue Found:** The `rel` attribute is set in the editor, but `target="_blank"` is NOT set. This means links will open in the same tab by default.

**Verification Needed:**
- [ ] Check if links in RichTextDisplay open in new tab
- [ ] Verify security attributes (rel="noopener noreferrer nofollow") are preserved after sanitization
- [ ] If target="_blank" not working, add to sanitize.ts ALLOWED_ATTR or configure in Link extension

**Sanitization Config (sanitize.ts line 19):**
```typescript
ALLOWED_ATTR: ['href', 'target', 'rel'],
```
- `target` is already allowed, but links need `target="_blank"` to be added to the HTML

### 3. Legacy Plain-Text Notes Handling

**Current State:** The `isRichText()` function in sanitize.ts detects HTML:
```typescript
// sanitize.ts lines 49-57
export function isRichText(content: string): boolean {
  const htmlPattern = /<[a-z][\s\S]*>/i;
  return htmlPattern.test(content);
}
```

**How it works:**
- If content has HTML tags -> treat as rich text, sanitize and render HTML
- If content has no HTML tags -> treat as plain text, escape HTML entities

**Verification Needed:**
- [ ] Load a pre-v2.3 session note (plain text) and verify it displays correctly
- [ ] Verify plain text like "<b>test</b>" is escaped and shows as literal text, not bold

### 4. Character Limit Validation

**Current State:** There is a MAX_NOTE_LENGTH = 2000 in useSessionNotes.ts:
```typescript
// src/hooks/useSessionNotes.ts lines 6-32
const MAX_NOTE_LENGTH = 2000

const handleNoteChange = useCallback((text: string) => {
  if (text.length <= MAX_NOTE_LENGTH) {
    dispatch(setNoteText(text))
    onSave?.(text, tags)
  }
}, [dispatch, tags, onSave])
```

**Potential Issue:** The character limit check uses `text.length` which counts raw characters in the HTML string. With HTML formatting, this means:
- Plain text "Hello" = 5 characters
- HTML "<p>Hello</p>" = 17 characters

**This is actually the correct behavior** because:
1. The limit is on stored content size (IndexedDB)
2. HTML overhead is part of the storage cost
3. Users see real-time feedback as they type

**However, UX consideration:** Users might expect 2000 visible characters, not 2000 stored characters. Consider:
- Option A: Keep current behavior (store limit)
- Option B: Show visible character count (strip HTML tags for count display)

**Verification Needed:**
- [ ] Type 2000 characters of plain text - verify it saves
- [ ] Type 2000 characters with formatting - verify it saves
- [ ] Verify error/feedback when limit is reached

### 5. End-to-End Testing Checklist

| Feature | Test |
|---------|------|
| Start focus session | Timer starts, NotePanel visible |
| Type plain text | Text appears in editor |
| Apply bold (toolbar) | Text becomes bold |
| Apply bold (Cmd+B) | Text becomes bold |
| Remove bold (Cmd+B) | Bold removed |
| Apply bullet list | List created |
| Insert link | Link appears, clickable |
| Complete session | Session saves, summary shows formatted text |
| View history | Session shows in list |
| View session details | RichTextDisplay shows formatted notes |
| Edit note in history | Switch to edit mode, modify, save |
| Open in new browser | All data persists correctly |

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @tiptap/react | ^3.20.0 | React editor hooks | Installed |
| @tiptap/starter-kit | ^3.20.0 | Core extensions with keyboard shortcuts | Installed |
| @tiptap/extension-link | ^3.20.0 | Link functionality | Installed |
| dompurify | ^3.0.0 | HTML sanitization | Installed |
| styled-components | ^6.3.10 | Component styling | Installed |

---

## Architecture Patterns

### Pattern 1: Verifying Keyboard Shortcuts

**What:** Confirm Cmd/Ctrl+B works in the Tiptap editor
**When:** During Phase 22 verification

Tiptap StarterKit automatically binds:
- Cmd/Ctrl+B: Toggle bold
- Cmd/Ctrl+I: Toggle italic (not used in v2.3)
- Cmd/Ctrl+Shift+X: Toggle strikethrough (not used in v2.3)

**Verification:**
```bash
# Start app, open browser DevTools console
# Start focus session
# Type text in editor
# Press Cmd+B (Mac) or Ctrl+B (Windows)
# Verify text becomes bold
```

### Pattern 2: Link Security Attributes

**What:** Ensure links open safely with proper attributes
**When:** If links don't open in new tab

**Option A: Add target in editor (recommended)**
```typescript
// In RichTextEditor.tsx - Link.configure
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    rel: 'noopener noreferrer nofollow',
    target: '_blank',  // Add this line
  },
})
```

**Option B: Add target during sanitization**
```typescript
// In sanitize.ts - modify sanitizeHtml function
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('a').forEach(a => {
    a.setAttribute('target', '_blank')
  })
  return DOMPurify.sanitize(doc.body.innerHTML, SANITIZE_CONFIG_NO_STYLES)
}
```

### Pattern 3: Character Limit Display (Optional Enhancement)

**What:** Show users remaining character count
**When:** If 2000 character limit feels confusing with HTML

```typescript
// Add to NotePanel.tsx - show character count
const characterCount = noteText.replace(/<[^>]*>/g, '').length
const remaining = MAX_NOTE_LENGTH - characterCount

<CharacterCount $warning={remaining < 200}>
  {remaining} characters remaining
</CharacterCount>
```

---

## Common Pitfalls

### Pitfall 1: Links Don't Open in New Tab

**What goes wrong:** Links in SessionSummary and HistoryDrawer open in same tab

**Why it happens:** RichTextEditor doesn't set target="_blank" by default, relying on browser behavior

**How to fix:** Add target="_blank" to Link configuration in RichTextEditor.tsx

### Pitfall 2: Character Limit Confuses Users

**What goes wrong:** Users think they can type 2000 visible characters but hit limit early with HTML

**Why it happens:** HTML tags count toward the 2000 character limit

**How to fix:** Either accept current behavior (technical limit) or show visible character count

### Pitfall 3: Legacy Notes Show Raw HTML Tags

**What goes wrong:** Old plain-text notes show tags like <p>Hello</p>

**Why it happens:** Content wasn't migrated to HTML format

**How to verify:** Test with old data - isRichText() should detect no HTML tags and escape content

### Pitfall 4: Cmd+B Doesn't Work

**What goes wrong:** Keyboard shortcut has no effect

**Why it happens:** Editor might not have focus

**How to fix:** Ensure editor has focus before testing shortcut

---

## Open Questions

1. **Should links open in new tab by default?**
   - What we know: Current config sets rel but not target
   - What's unclear: User expectation for link behavior
   - Recommendation: Add target="_blank" for better UX

2. **Should character limit show visible count vs. stored count?**
   - What we know: Current implementation uses stored count (HTML included)
   - What's unclear: Whether users find this confusing
   - Recommendation: Test with users, consider showing visible count if confusing

3. **Should we add Cmd+S to save session notes?**
   - What we know: Currently no keyboard shortcut for saving
   - What's unclear: Whether this is needed for v2.3
   - Recommendation: Out of scope for v2.3 polish, can add later

---

## Files to Modify (if changes needed)

| File | Change | Reason |
|------|--------|--------|
| src/components/RichTextEditor.tsx | Add target="_blank" to Link config | Ensure links open in new tab |
| src/utils/sanitize.ts | Add target attribute if not preserved | Backup link safety |
| src/components/NotePanel.tsx | Add character count display (optional) | UX improvement |

---

## Sources

### Primary (HIGH confidence)
- RichTextEditor: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/RichTextEditor.tsx` - Current implementation
- RichTextDisplay: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/RichTextDisplay.tsx` - Display component
- Sanitize utils: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/utils/sanitize.ts` - XSS protection
- Session notes hook: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useSessionNotes.ts` - Character limit logic

### Secondary (HIGH confidence)
- Phase 19 Research: `/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/phases/19-editor-component/19-RESEARCH.md` - Editor patterns
- Phase 21 Research: `/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/phases/21-read-only-display/21-RESEARCH.md` - Display integration

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - All packages already installed
- Architecture: HIGH - All components integrated in phases 18-21
- Pitfalls: HIGH - Known issues documented with solutions
- Verification: MEDIUM - Need manual browser testing to confirm

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days for stable library)

---

## RESEARCH COMPLETE

**Phase:** 22 - Polish & Validation
**Confidence:** HIGH

### Key Findings
1. Tiptap StarterKit includes Cmd/Ctrl+B keyboard shortcut by default - should work
2. Link security (rel="noopener noreferrer nofollow") is configured in editor, but target="_blank" may need to be added
3. Legacy plain-text handling is already implemented via isRichText() detection
4. Character limit (2000) exists but counts HTML characters - verify this is intentional
5. End-to-end browser testing needed to verify all features work together

### File Created
`.planning/phases/22-polish-validation/22-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All packages installed |
| Architecture | HIGH | Components integrated in phases 18-21 |
| Pitfalls | HIGH | Known issues documented |
| Verification | MEDIUM | Manual browser testing needed |

### Ready for Planning
Research complete. Planner can now create PLAN.md files to verify and polish the v2.3 implementation.
