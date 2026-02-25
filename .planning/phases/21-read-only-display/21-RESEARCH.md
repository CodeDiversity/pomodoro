# Phase 21: Read-Only Display Integration - Research

**Researched:** 2026-02-24
**Domain:** React Component Integration, Rich Text Display
**Confidence:** HIGH

## Summary

Phase 21 integrates the existing RichTextDisplay component into SessionSummary modal and HistoryDrawer to show formatted notes (bold, bullet lists, links) instead of plain text or raw HTML. The RichTextDisplay component was created in Phase 18 with XSS sanitization via DOMPurify. This phase addresses RTD-01 through RTD-06 requirements.

**Primary recommendation:** Replace plain text rendering in SessionSummary with RichTextDisplay, and modify HistoryDrawer to show formatted notes (likely with a display/edit toggle since it currently allows editing).

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RTD-01 | Session notes display bold text correctly in session summary modal | RichTextDisplay component exists, handles `<strong>`, `<b>` tags |
| RTD-02 | Session notes display bullet lists correctly in session summary modal | RichTextDisplay handles `<ul>`, `<ol>`, `<li>` tags |
| RTD-03 | Session notes display clickable links in session summary modal | RichTextDisplay handles `<a>` tags with href, styled with app colors |
| RTD-04 | Session notes display bold text correctly in history details drawer | Same RichTextDisplay integration, different component |
| RTD-05 | Session notes display bullet lists correctly in history details drawer | Same RichTextDisplay integration, different component |
| RTD-06 | Session notes display clickable links in history details drawer | Same RichTextDisplay integration, different component |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| RichTextDisplay | Existing (Phase 18) | Read-only rendering with XSS protection | Already implemented with DOMPurify |
| dompurify | ^3.0.0 | HTML sanitization | Already installed in Phase 18 |
| styled-components | ^6.3.10 | Component styling | Already installed |

### Already Implemented (from Phase 18)

- `src/components/RichTextDisplay.tsx` - Read-only display component with sanitization
- `src/utils/sanitize.ts` - DOMPurify utilities with strict allowlist

**Installation:**
```bash
# All packages already installed - verify with:
npm list dompurify
```

## Architecture Patterns

### Recommended Integration Structure

```
src/components/
├── SessionSummary.tsx      # MODIFY: Replace DetailValue with RichTextDisplay
├── RichTextDisplay.tsx    # EXISTS (Phase 18)
└── history/
    └── HistoryDrawer.tsx  # MODIFY: Add display mode or replace textarea
```

### Integration Pattern: SessionSummary

**What:** Replace the plain text note display with RichTextDisplay component
**When to use:** When showing completed session notes in the summary modal
**Example:**

```typescript
// In SessionSummary.tsx - BEFORE (current code at lines 210-213):
<DetailSection>
  <DetailLabel>Notes</DetailLabel>
  <DetailValue>{session.noteText}</DetailValue>
</DetailSection>

// AFTER (Phase 21 implementation):
<DetailSection>
  <DetailLabel>Notes</DetailLabel>
  <RichTextDisplay content={session.noteText} />
</DetailSection>
```

**Import needed:**
```typescript
import RichTextDisplay from './RichTextDisplay'
```

### Integration Pattern: HistoryDrawer

**What:** Show formatted notes in the history drawer (currently editable textarea)
**When to use:** When viewing session details from history

**Design Decision Required:** The HistoryDrawer currently allows editing notes via textarea. Two approaches:

1. **Display-only approach:** Replace textarea with RichTextDisplay, add "Edit" button to switch to edit mode
2. **Side-by-side approach:** Show RichTextDisplay above the textarea for preview

**Recommended (Approach 1):**
```typescript
// Add state for edit mode
const [isEditing, setIsEditing] = useState(false)

// In the DetailRow for notes:
<DetailRow>
  <DetailLabel>
    Note
    <EditButton onClick={() => setIsEditing(!isEditing)}>
      {isEditing ? 'View' : 'Edit'}
    </EditButton>
  </DetailLabel>
  {isEditing ? (
    <NoteTextArea
      value={noteText}
      onChange={(e) => handleNoteChange(e.target.value)}
      placeholder="Add a note..."
    />
  ) : (
    <RichTextDisplay content={noteText || ''} />
  )}
</DetailRow>
```

### Key Integration Points

1. **SessionSummary:**
   - Import RichTextDisplay
   - Replace `<DetailValue>{session.noteText}</DetailValue>` with `<RichTextDisplay content={session.noteText} />`
   - Currently at lines 210-213 in SessionSummary.tsx

2. **HistoryDrawer:**
   - Import RichTextDisplay
   - Add edit toggle state
   - Conditionally render textarea (edit mode) or RichTextDisplay (view mode)
   - Currently lines 367-377 in HistoryDrawer.tsx

### Anti-Patterns to Avoid

- **Displaying raw HTML:** Never render noteText directly without RichTextDisplay - causes XSS vulnerabilities and shows raw tags
- **Breaking legacy plain text:** RichTextDisplay handles both HTML and plain text automatically via `isRichText()` detection
- **Removing edit functionality completely:** Users should still be able to edit notes from HistoryDrawer

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML sanitization | Custom regex stripping | RichTextDisplay + dompurify | Phase 18 handles XSS protection |
| Rich text rendering | Parse HTML manually | RichTextDisplay | Already handles bold, bullets, links |
| Plain text detection | Custom logic | isRichText() from sanitize.ts | Already implemented |

**Key insight:** RichTextDisplay is a complete solution for rendering formatted notes safely. Integration is straightforward component replacement.

## Common Pitfalls

### Pitfall 1: Forgetting to Import RichTextDisplay

**What goes wrong:** Component doesn't render, undefined error

**Why it happens:** Developer assumes component is auto-imported

**How to avoid:** Add import statement at top of file:
```typescript
import RichTextDisplay from './RichTextDisplay'
```

### Pitfall 2: Passing Undefined Content

**What goes wrong:** RichTextDisplay shows nothing or error

**Why it happens:** noteText is undefined instead of empty string

**How to avoid:** Use fallback empty string:
```typescript
<RichTextDisplay content={session?.noteText || ''} />
```

### Pitfall 3: Not Handling Empty Notes

**What goes wrong:** Blank area shows when no notes

**Why it happens:** RichTextDisplay returns null for empty content (designed behavior)

**How to avoid:** This is correct behavior - don't wrap in conditional unless you want to show placeholder

### Pitfall 4: Links Not Clickable

**What goes wrong:** Links render but aren't clickable

**Why it happens:** Missing href attribute or sanitization stripping href

**How to avoid:** RichTextDisplay allows 'href' attribute - verify content has proper link markup:
```html
<a href="https://example.com">Link</a>
```
(not just plain URLs)

### Pitfall 5: Styling Conflicts

**What goes wrong:** RichTextDisplay looks different from surrounding text

**Why it happens:** Different font family, line height, or colors

**How to avoid:** RichTextDisplay inherits font family, uses app colors from theme. Verify the DetailValue styling is compatible.

## Code Examples

### SessionSummary Changes

```typescript
// File: src/components/SessionSummary.tsx

// Add import at top (around line 3):
import RichTextDisplay from './RichTextDisplay'

// Replace lines 210-213:
// BEFORE:
<DetailSection>
  <DetailLabel>Notes</DetailLabel>
  <DetailValue>{session.noteText}</DetailValue>
</DetailSection>

// AFTER:
<DetailSection>
  <DetailLabel>Notes</DetailLabel>
  <RichTextDisplay content={session.noteText || ''} />
</DetailSection>
```

### HistoryDrawer Changes

```typescript
// File: src/components/history/HistoryDrawer.tsx

// Add import at top (around line 7):
import RichTextDisplay from '../RichTextDisplay'

// Add edit mode state (around line 261):
const [isEditingNotes, setIsEditingNotes] = useState(false)

// Replace lines 367-377:
// BEFORE:
<DetailRow>
  <DetailLabel>Note</DetailLabel>
  <NoteTextArea
    value={noteText}
    onChange={(e) => handleNoteChange(e.target.value)}
    placeholder="Add a note..."
  />
  <SaveStatus $saving={isSaving}>
    {isSaving ? 'Saving...' : 'Saved'}
  </SaveStatus>
</DetailRow>

// AFTER:
<DetailRow>
  <DetailLabel>
    Note
    <Button
      onClick={() => setIsEditingNotes(!isEditingNotes)}
      style={{ marginLeft: '8px', fontSize: '12px' }}
    >
      {isEditingNotes ? 'View' : 'Edit'}
    </Button>
  </DetailLabel>
  {isEditingNotes ? (
    <>
      <NoteTextArea
        value={noteText}
        onChange={(e) => handleNoteChange(e.target.value)}
        placeholder="Add a note..."
      />
      <SaveStatus $saving={isSaving}>
        {isSaving ? 'Saving...' : 'Saved'}
      </SaveStatus>
    </>
  ) : (
    <RichTextDisplay content={noteText || ''} />
  )}
</DetailRow>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|--------------|--------|
| Plain text in SessionSummary | RichTextDisplay | Phase 21 | Bold, bullets, links render correctly |
| Textarea in HistoryDrawer | Toggle between RichTextDisplay + textarea | Phase 21 | Read-only formatted view + edit capability |
| XSS risk with raw HTML | DOMPurify sanitization | Phase 18 | Safe rendering |

**Deprecated/outdated:**
- Plain text noteText rendering - Being replaced with RichTextDisplay
- Always-editable HistoryDrawer notes - Adding view mode

## Open Questions

1. **Should HistoryDrawer default to view or edit mode?**
   - What we know: Currently always shows textarea. Users may want quick view first.
   - What's unclear: Which mode is more useful as default
   - Recommendation: Default to edit mode (current behavior) to maintain backward compatibility, users can click "View" to see formatted

2. **Should SessionSummary show notes at all if empty?**
   - What we know: RichTextDisplay returns null for empty content
   - What's unclear: Whether to show "No notes" placeholder
   - Recommendation: Keep current behavior - no notes = nothing shown

3. **What about styling in HistoryDrawer?**
   - What we know: DetailValue has specific styling, RichTextDisplay has its own styles
   - What's unclear: Potential conflicts
   - Recommendation: Test visually, RichTextDisplay should inherit appropriately

## Sources

### Primary (HIGH confidence)
- RichTextDisplay component: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/RichTextDisplay.tsx` - Already implemented
- SessionSummary component: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/SessionSummary.tsx` - Integration target
- HistoryDrawer component: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/history/HistoryDrawer.tsx` - Integration target
- Sanitization utilities: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/utils/sanitize.ts` - Already implemented
- DOMPurify: https://github.com/cure53/DOMPurify - Security library documentation

### Secondary (MEDIUM confidence)
- Phase 18 Context: `/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/phases/18-editor-infrastructure/18-CONTEXT.md` - Phase 18 decisions
- Phase 20 Research: `/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/phases/20-notepanel-integration/20-RESEARCH.md` - Similar integration pattern

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - All components exist, no new packages needed
- Architecture: HIGH - Clear component replacement pattern
- Pitfalls: HIGH - Known issues documented

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days for stable library)

---

## RESEARCH COMPLETE

**Phase:** 21 - Read-Only Display Integration
**Confidence:** HIGH

### Key Findings
1. RichTextDisplay component already exists with full functionality (Phase 18)
2. Integration is straightforward: import and replace/render component
3. SessionSummary: Replace DetailValue with RichTextDisplay
4. HistoryDrawer: Add edit/view toggle to show formatted notes
5. All sanitization already handled by DOMPurify (Phase 18)
6. Both HTML and plain text handled automatically via isRichText detection

### File Created
`.planning/phases/21-read-only-display/21-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All packages installed, components exist |
| Architecture | HIGH | Clear replacement pattern |
| Pitfalls | HIGH | Known issues documented |

### Open Questions
- HistoryDrawer default mode (edit vs view)
- Visual styling verification needed after integration

### Ready for Planning
Research complete. Planner can now create PLAN.md files.
