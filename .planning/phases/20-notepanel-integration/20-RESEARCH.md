# Phase 20: NotePanel Integration - Research

**Researched:** 2026-02-24
**Domain:** React Component Integration, Rich Text Editor
**Confidence:** HIGH

## Summary

Phase 20 integrates the existing RichTextEditor component into the NotePanel, replacing the plain textarea. The RichTextEditor component was created in Phase 19 with Bold, Bullet List, and Link functionality. The integration is straightforward: replace the existing TextArea with the RichTextEditor component and remove the placeholder toolbar buttons (since RichTextEditor includes its own toolbar).

**Primary recommendation:** Replace NotePanel's TextArea with RichTextEditor, remove the existing non-functional toolbar, and ensure HTML content flows correctly through the existing note state management.

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RTE-04 | Rich text editor replaces textarea in NotePanel during active session | RichTextEditor API: `content` prop accepts HTML string, `onChange` callback returns HTML |
| RTE-05 | Toolbar buttons (Bold, Bullet, Link) are functional and styled | RichTextEditor includes functional toolbar with active state styling |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tiptap/react | ^3.20.0 | Rich text editor React integration | Already installed, created in Phase 19 |
| @tiptap/starter-kit | ^3.20.0 | Core formatting extensions | Already installed |
| @tiptap/extension-link | ^3.20.0 | Link functionality | Already installed |
| styled-components | ^6.3.10 | Component styling | Already installed |

### Already Implemented (from Phase 19)

- `src/components/RichTextEditor.tsx` - Complete editor with toolbar
- `src/components/RichTextDisplay.tsx` - Read-only display (Phase 21 will integrate this)

**Installation:**
```bash
# All packages already installed - verify with:
npm list @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

## Architecture Patterns

### Recommended Integration Pattern

```
src/components/
├── NotePanel.tsx           # MODIFY: Replace textarea with RichTextEditor
├── RichTextEditor.tsx      # ALREADY EXISTS (Phase 19)
└── RichTextDisplay.tsx     # ALREADY EXISTS (Phase 18, for Phase 21)
```

### Integration Pattern: Replace TextArea with RichTextEditor

**What:** Swap the plain textarea for the RichTextEditor component
**When to use:** In NotePanel during active focus session
**Example:**

```typescript
// In NotePanel.tsx - BEFORE (current code):
<NotesContainer>
  <Toolbar>
    <ToolbarButton aria-label="Bold" title="Bold">
      <BoldIcon />
    </ToolbarButton>
    {/* ... more placeholder buttons */}
  </Toolbar>
  <TextArea
    value={noteText}
    onChange={(e) => onNoteChange(e.target.value)}
    placeholder="Brainstorming key UI components..."
  />
</NotesContainer>

// AFTER (Phase 20 implementation):
<NotesContainer>
  <RichTextEditor
    content={noteText}
    onChange={onNoteChange}
  />
</NotesContainer>
```

### Key Integration Points

1. **Import the component:**
```typescript
import RichTextEditor from './RichTextEditor'
```

2. **Remove placeholder toolbar:** The current NotePanel has placeholder toolbar buttons that don't work. These should be removed since RichTextEditor includes its own functional toolbar.

3. **Data flow remains the same:**
```typescript
// App.tsx passes: noteText (string) -> onNoteChange (callback)
// RichTextEditor accepts: content (string) -> onChange (callback returns HTML)
// The HTML string is stored directly in noteText field
```

4. **Existing state management:** The `handleNoteChange` function in App.tsx already handles the noteText state - no changes needed there.

### Anti-Patterns to Avoid

- **Removing the existing NotesContainer wrapper:** The container provides the border, border-radius, and background styling needed for visual consistency
- **Not handling empty content:** RichTextEditor handles empty content correctly (outputs empty string or `<p></p>`)
- **Removing the NotesContainer styling:** Keep the container, just replace the internal textarea+toolbar with RichTextEditor

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom contenteditable | RichTextEditor | Already implemented, tested |
| Toolbar functionality | Custom toolbar buttons | RichTextEditor's built-in toolbar | Already has Bold, Bullet, Link |
| HTML sanitization | Custom regex | dompurify in RichTextDisplay | Already handled in Phase 18 |

**Key insight:** The RichTextEditor component from Phase 19 is fully self-contained with its own toolbar. Integration requires minimal code changes.

## Common Pitfalls

### Pitfall 1: Forgetting to Remove Placeholder Toolbar

**What goes wrong:** Duplicate toolbars appear - the placeholder toolbar and RichTextEditor's toolbar.

**Why it happens:** Developer keeps the existing placeholder toolbar alongside RichTextEditor.

**How to avoid:** Replace the entire TextArea + Toolbar section with just RichTextEditor:

```typescript
// WRONG - keeps both toolbars
<NotesContainer>
  <Toolbar> {/* Placeholder - DELETE THIS */}
    <ToolbarButton>...</ToolbarButton>
  </Toolbar>
  <RichTextEditor content={noteText} onChange={onNoteChange} />
</NotesContainer>

// CORRECT - just the editor
<NotesContainer>
  <RichTextEditor content={noteText} onChange={onNoteChange} />
</NotesContainer>
```

### Pitfall 2: HTML Content Not Rendering in Session Summary

**What goes wrong:** After session ends, notes display as HTML tags in the summary.

**Why it happens:** Session summary uses plain text rendering instead of RichTextDisplay.

**How to avoid:** This will be addressed in Phase 21. For now, the HTML is stored correctly in IndexedDB. Phase 21 will render it properly.

### Pitfall 3: Character Limit Validation Issues

**What goes wrong:** Character count includes HTML tags, giving inaccurate count.

**Why it happens:** The noteText now contains HTML markup.

**How to avoid:** Phase 22 will address this with proper HTML-aware character counting. For Phase 20, don't add character limit validation.

### Pitfall 4: RichTextEditor Shows Loading State

**What goes wrong:** Editor shows nothing briefly during initialization.

**Why it happens:** useEditor hook returns null during initialization.

**How to avoid:** RichTextEditor already handles this with `if (!editor) return null`. However, this can cause layout shift. Consider adding a min-height placeholder if this becomes an issue.

## Code Examples

### Complete Integration (NotePanel.tsx Changes)

```typescript
// Imports needed
import RichTextEditor from './RichTextEditor'

// In the component, replace lines 451-471:
// BEFORE:
<Section>
  <SectionLabel>Session Notes</SectionLabel>
  <NotesContainer>
    <Toolbar>
      <ToolbarButton aria-label="Bold" title="Bold">
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="List" title="List">
        <ListIcon />
      </ToolbarButton>
      <ToolbarButton aria-label="Link" title="Link">
        <LinkIcon />
      </ToolbarButton>
    </Toolbar>
    <TextArea
      value={noteText}
      onChange={(e) => onNoteChange(e.target.value)}
      placeholder="Brainstorming key UI components..."
    />
  </NotesContainer>
</Section>

// AFTER:
<Section>
  <SectionLabel>Session Notes</SectionLabel>
  <NotesContainer>
    <RichTextEditor
      content={noteText}
      onChange={onNoteChange}
    />
  </NotesContainer>
</Section>
```

### Remove Unused Icons

After integration, these icon components are no longer needed in NotePanel:
- BoldIcon (line 324-329)
- ListIcon (line 331-340)
- LinkIcon (line 342-347)

Also remove:
- Toolbar styled component (lines 100-129)
- ToolbarButton styled component (lines 108-129)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|--------------|--------|
| Plain textarea | RichTextEditor | Phase 20 | Enables bold, bullets, links in NotePanel |
| Placeholder non-functional toolbar | RichTextEditor's functional toolbar | Phase 20 | Working Bold, Bullet, Link buttons |
| Plain text storage | HTML string storage | Phase 20 | Formatting preserved in IndexedDB |

**Deprecated/outdated:**
- Plain textarea for notes - Replaced with RichTextEditor
- Non-functional toolbar buttons - Removed

## Open Questions

1. **Should the NotesContainer styling be adjusted for the new editor?**
   - What we know: NotesContainer provides border and background. RichTextEditor has its own border styling.
   - What's unclear: Whether double-borders or styling conflicts will occur
   - Recommendation: Test visually after integration, adjust if needed

2. **How to handle the placeholder text?**
   - What we know: Textarea had placeholder "Brainstorming key UI components...". RichTextEditor doesn't have built-in placeholder.
   - What's unclear: Whether this placeholder is important for UX
   - Recommendation: Add placeholder via Tiptap extension in Phase 22 if needed, or use CSS ::before pseudo-element

3. **What happens to existing plain-text notes?**
   - What we know: Existing notes are plain text (no HTML). RichTextEditor handles this correctly.
   - What's unclear: Whether there's any edge case with special characters
   - Recommendation: Test with existing data, Phase 18 already handles legacy notes

## Sources

### Primary (HIGH confidence)
- RichTextEditor component: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/RichTextEditor.tsx` - Already implemented
- NotePanel component: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/NotePanel.tsx` - Integration target
- Tiptap React: https://tiptap.dev/docs/editor/getting-started/install/react - API documentation
- Phase 19 Research: `/Users/michaelrobert/Documents/GitHub/pomodoro/.planning/phases/19-editor-component/19-RESEARCH.md`

### Secondary (MEDIUM confidence)
- Tiptap Editor API - Confirmed via Phase 19 research

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - All packages already installed from Phase 18/19
- Architecture: HIGH - Clear component replacement pattern
- Pitfalls: HIGH - Known issues documented from Phase 19

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days for stable library)

---

## RESEARCH COMPLETE

**Phase:** 20 - NotePanel Integration
**Confidence:** HIGH

### Key Findings
1. RichTextEditor component already exists with proper API (`content`, `onChange`)
2. Integration is straightforward: replace TextArea + placeholder toolbar with RichTextEditor
3. Remove unused icon components (BoldIcon, ListIcon, LinkIcon) and toolbar styled components
4. Data flow already works: HTML string stored in noteText, no App.tsx changes needed
5. Session summary will display HTML tags until Phase 21 integrates RichTextDisplay

### File Created
`.planning/phases/20-notepanel-integration/20-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All packages installed, component exists |
| Architecture | HIGH | Clear replacement pattern |
| Pitfalls | HIGH | Documented from Phase 19 experience |

### Open Questions
- Visual styling adjustments may be needed (double-borders)
- Placeholder text handled via CSS or Phase 22
- Legacy plain-text notes already handled by Phase 18

### Ready for Planning
Research complete. Planner can now create PLAN.md files.
