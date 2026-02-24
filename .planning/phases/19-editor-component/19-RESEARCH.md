# Phase 19: Editor Component - Research

**Researched:** 2026-02-24
**Domain:** Tiptap React Rich Text Editor with Toolbar
**Confidence:** HIGH

## Summary

Phase 19 builds on Phase 18's infrastructure to create a functional RichTextEditor component with working toolbar buttons. The project already has Tiptap packages installed (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link) and a RichTextDisplay component for read-only rendering. This phase creates the editable editor with Bold, Bullet List, and Link functionality that will integrate into NotePanel in Phase 20.

**Primary recommendation:** Create a RichTextEditor component using Tiptap's useEditor hook with StarterKit (includes Bold, BulletList, Link) and implement a toolbar that uses editor.isActive() for button state and editor.getHTML() for content retrieval.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Tiptap for rich text editing** — Headless, full UI control, built on ProseMirror
- **HTML storage format** — Stores in existing noteText field - no schema changes
- **dompurify for XSS prevention** — Industry standard for sanitizing HTML
- **RichTextDisplay shared component** — Consistent rendering across modal and history drawer

### Claude's Discretion

- Exact sanitization allowlist configuration (already done in Phase 18)
- Specific CSS rules for each element type (ul/ol indent, p margins)
- Error boundary handling for malformed HTML
- Performance considerations for large notes

### Deferred Ideas (OUT OF SCOPE)

- RichTextEditor with toolbar — **Phase 19 (this phase)**
- NotePanel integration — Phase 20
- Read-only display in SessionSummary/HistoryDrawer — Phase 21

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RTE-01 | User can toggle bold formatting via toolbar button | Tiptap `toggleBold()` command + `isActive('bold')` for state |
| RTE-02 | User can toggle bullet list formatting via toolbar button | Tiptap `toggleBulletList()` command + `isActive('bulletList')` for state |
| RTE-03 | User can insert links via toolbar button with URL input | Tiptap `setLink({ href })` command + prompt/modal for URL input |
| RTE-04 | Rich text editor replaces textarea in NotePanel during active session | Component API design - Editor outputs HTML string via `getHTML()` |
| RTE-05 | Toolbar buttons (Bold, Bullet, Link) are functional and styled | Toolbar component with styled-components, active state styling |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tiptap/react | ^3.20.0 | React editor hook and components | Already installed, headless editor |
| @tiptap/starter-kit | ^3.20.0 | Core extensions (Bold, BulletList, Link) | Already installed, includes all needed formatting |
| @tiptap/extension-link | ^3.20.0 | Link functionality | Already installed, provides setLink/unsetLink |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-icons | ^5.5.0 | Icon components | Already installed - use for toolbar icons |
| styled-components | ^6.3.10 | Component styling | Already installed - use for toolbar and editor styling |

### Not Needed

- Additional Tiptap extensions — StarterKit v3 includes Bold, BulletList, Link, Italic, Strike, Underline
- Bubble menu — Simple toolbar is sufficient for this use case

**Installation:**
```bash
# All packages already installed from Phase 18
npm list @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── RichTextDisplay.tsx    # Phase 18 - Read-only rendering
│   ├── RichTextEditor.tsx     # Phase 19 - EDITABLE editor with toolbar
│   └── NotePanel.tsx          # Phase 20 - Integration target
├── utils/
│   ├── sanitize.ts            # Phase 18 - XSS sanitization
│   └── createLinkInput.ts     # Phase 19 - Optional: Link input modal/prompt
```

### Pattern 1: Tiptap Editor with useEditor

**What:** Basic Tiptap React setup with useEditor hook
**When to use:** Creating any editable rich text editor
**Example:**

```typescript
// Source: https://tiptap.dev/docs/editor/getting-started/install/react
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

const RichTextEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable features not needed for v2.3
        heading: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}
```

### Pattern 2: Toolbar with Active State

**What:** Toolbar buttons that reflect current formatting state
**When to use:** Any editor toolbar where buttons should show active/inactive state
**Example:**

```typescript
// Check if format is active: editor.isActive('bold')
const ToolbarButton = styled.button<{ $isActive: boolean }>`
  background: ${({ $isActive }) => $isActive ? '#e2e8f0' : 'transparent'};
  /* other styles */
`

// Usage in toolbar
<ToolbarButton
  $isActive={editor.isActive('bold')}
  onClick={() => editor.chain().focus().toggleBold().run()}
>
  <BoldIcon />
</ToolbarButton>
```

### Pattern 3: Link Insertion with URL Input

**What:** Prompt user for URL when inserting links
**When to use:** Link button click - either browser prompt or custom modal
**Example:**

```typescript
// Simple approach: browser prompt
const insertLink = () => {
  const previousUrl = editor.getAttributes('link').href
  const url = window.prompt('Enter URL', previousUrl)

  if (url === null) return

  if (url === '') {
    editor.chain().focus().unsetLink().run()
    return
  }

  editor.chain().focus().setLink({ href: url }).run()
}

// Check if link is active: editor.isActive('link')
const isLinkActive = editor.isActive('link')
```

### Pattern 4: Styled Editor Content

**What:** Apply styling to Tiptap editor content using .tiptap class
**When to use:** Matching editor styling with read-only RichTextDisplay
**Example:**

```typescript
// Source: https://tiptap.dev/docs/editor/getting-started/style-editor
const EditorContainer = styled.div`
  .tiptap {
    min-height: 160px;
    padding: 16px;

    p {
      margin-bottom: 8px;
    }

    ul, ol {
      padding-left: 24px;
    }

    a {
      color: ${colors.primary};
    }
  }
`
```

### Anti-Patterns to Avoid

- **Direct HTML manipulation:** Never manually construct HTML strings - use Tiptap commands
- **Missing focus() call:** Always chain .focus() before toggle commands so user can continue typing
- **No XSS sanitization on input:** Phase 18's sanitize.ts handles output, but editor content should come from trusted sources
- **Forgetting to check if editor exists:** Always check `if (!editor) return null` before using editor API

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom contenteditable solution | Tiptap | Browser inconsistencies, accessibility issues, complex |
| HTML sanitization | Custom regex sanitization | dompurify (Phase 18) | XSS vulnerabilities are critical |
| Link validation | Custom URL regex | Tiptap Link extension | Handles protocols, edge cases |
| Editor state management | Custom state sync | Tiptap's built-in state | ProseMirror handles all edge cases |

**Key insight:** Tiptap is built on ProseMirror which has years of battle-testing for contentEditable edge cases. Building from scratch would introduce numerous bugs.

## Common Pitfalls

### Pitfall 1: Missing focus() in Toolbar Commands

**What goes wrong:** After clicking a toolbar button, the cursor moves to the beginning of the editor or the button loses focus, interrupting typing flow.

**Why it happens:** Toggle commands operate on the current selection without restoring focus to the editor.

**How to avoid:** Always chain `.focus()` before the toggle command:

```typescript
// Wrong
editor.chain().toggleBold().run()

// Correct
editor.chain().focus().toggleBold().run()
```

### Pitfall 2: Link Prompt Cancels Selection

**What goes wrong:** When user selects text and clicks Link button, browser prompt appears but the selection is lost.

**Why it happens:** Browser prompt modals lose the text selection in the background.

**How to avoid:** Store selection before prompt, or use a custom modal instead of window.prompt:

```typescript
// Store selection before prompt
const { from, to } = editor.state.selection
const selectedText = editor.state.doc.textBetween(from, to, ' ')

// Then after prompt, restore and apply
editor.chain().focus().setTextSelection({ from, to }).setLink({ href: url }).run()
```

### Pitfall 3: Editor Content Not Syncing

**What goes wrong:** Editor shows content but onChange callback doesn't fire or sends wrong data.

**Why it happens:** Not properly wiring onUpdate callback or using wrong method to get content.

**How to avoid:** Use onUpdate with getHTML():

```typescript
const editor = useEditor({
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML())
  },
})
```

### Pitfall 4: Missing Null Checks

**What goes wrong:** App crashes with "Cannot read property isActive of null"

**Why it happens:** useEditor returns null during initialization or if editor fails to create.

**How to avoid:** Always check if editor exists before using:

```typescript
if (!editor) return null

// In toolbar render
editor.isActive('bold')
```

## Code Examples

### RichTextEditor Component (Complete Pattern)

```typescript
import React from 'react'
import styled from 'styled-components'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { colors } from './ui/theme'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const EditorWrapper = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
`

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
`

const ToolbarButton = styled.button<{ $isActive: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isActive }) => $isActive ? '#e2e8f0' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: background-color 150ms;

  &:hover {
    background-color: #f1f5f9;
  }
`

const EditorArea = styled.div`
  .tiptap {
    min-height: 160px;
    padding: 16px;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;

    &:focus {
      outline: none;
    }

    p {
      margin-bottom: 8px;
    }

    ul, ol {
      padding-left: 24px;
      margin-bottom: 8px;
    }

    a {
      color: ${colors.primary};
    }
  }
`

// Icons (from react-icons or inline SVG)
const BoldIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>)
const ListIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>)
const LinkIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>)

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  })

  if (!editor) {
    return null
  }

  const handleLinkClick = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL', previousUrl || 'https://')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <EditorWrapper>
      <Toolbar>
        <ToolbarButton
          $isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          $isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton
          $isActive={editor.isActive('link')}
          onClick={handleLinkClick}
          title="Link"
        >
          <LinkIcon />
        </ToolbarButton>
      </Toolbar>
      <EditorArea>
        <EditorContent editor={editor} />
      </EditorArea>
    </EditorWrapper>
  )
}

export default RichTextEditor
```

### Integration with NotePanel (Phase 20 Pattern)

```typescript
// In NotePanel.tsx - replacing textarea
// Phase 20 will wire this up
import RichTextEditor from './RichTextEditor'

// Instead of:
// <TextArea value={noteText} onChange={onNoteChange} />

// Use:
// <RichTextEditor content={noteText} onChange={onNoteChange} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|--------------|--------|
| Plain textarea | Tiptap rich text editor | Phase 18-19 | Enables bold, bullets, links |
| No XSS protection | dompurify sanitization | Phase 18 | Security for user-generated HTML |
| Manual HTML string building | Tiptap commands | Phase 19 | Reliable, cross-browser formatting |

**Deprecated/outdated:**
- contenteditable directly — Too many edge cases, use Tiptap
- Custom regex sanitization — dompurify is the industry standard

## Open Questions

1. **Should link insertion use browser prompt or custom modal?**
   - What we know: Browser prompt is simple but loses text selection
   - What's unclear: Whether custom modal is worth the effort for v2.3
   - Recommendation: Start with browser prompt, upgrade to modal if UX issues arise

2. **How to handle placeholder text in Tiptap?**
   - What we know: Tiptap doesn't have built-in placeholder, requires extension
   - What's unclear: Whether placeholder is critical for v2.3
   - Recommendation: Use placeholder prop on textarea initially, Tiptap placeholder extension can be added later

3. **Should editor have border when focused?**
   - What we know: Current textarea has no focus border
   - What's unclear: Whether adding focus indicator improves UX
   - Recommendation: Follow current textarea behavior, add if needed

## Sources

### Primary (HIGH confidence)
- Tiptap React Installation: https://tiptap.dev/docs/editor/getting-started/install/react
- Tiptap StarterKit: https://tiptap.dev/docs/editor/extensions/functionality/starterkit
- Tiptap Link Extension: https://tiptap.dev/docs/editor/extensions/marks/link
- Tiptap Commands: https://tiptap.dev/docs/editor/api/commands
- Tiptap Styling: https://tiptap.dev/docs/editor/getting-started/style-editor

### Secondary (MEDIUM confidence)
- Tiptap isActive API (documented in official docs, confirmed through command docs)
- Link extension configuration (verified through extension docs)

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH - All packages already installed, clear documentation
- Architecture: HIGH - Clear component patterns from Tiptap docs
- Pitfalls: HIGH - Common issues well-documented, clear solutions

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days for stable library)
