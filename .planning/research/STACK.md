# Stack Research: v2.3 Rich Text Session Notes

**Domain:** React 18 + TypeScript - Rich Text Editor for Session Notes
**Researched:** 2026-02-24
**Confidence:** MEDIUM

## Executive Summary

For adding rich text editing (bold, bullet lists, clickable links) to an existing Pomodoro timer app:

1. **Tiptap recommended** — Headless, modular, built on ProseMirror (industry standard)
2. **Store as HTML string** — Integrates with existing `noteText: string` in Redux/IndexedDB
3. **~55KB total bundle impact** — Acceptable for feature set; React Quill is heavier (~40KB+ just for Quill)
4. **Existing toolbar can be wired up** — NotePanel.tsx already has Bold/List/Link button placeholders

---

## Recommended Stack

### Rich Text Editor

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @tiptap/react | ^3.20.0 | React wrapper for Tiptap editor | Headless, full UI control via styled-components. Built on ProseMirror (Google, Facebook, etc. use it). Active maintenance, strong TypeScript support. |
| @tiptap/starter-kit | ^3.20.0 | Basic editor extensions (bold, italic, bullet list, ordered list) | Tree-shakeable — only bundles what's used. Includes bold, bullet list out of box. |
| @tiptap/extension-link | ^3.20.0 | Clickable hyperlink support | Required for link feature. Configurable (openOnClick, auto-detect URLs). |

### Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

Verify versions:
```bash
npm view @tiptap/react version      # 3.20.0
npm view @tiptap/starter-kit version # 3.20.0
npm view @tiptap/extension-link version # 3.20.0
```

Note: Tiptap v3 is latest. For maximum stability, `npm install @tiptap/react@2` gets v2.x.

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Draft.js | Deprecated by Meta (2023), no longer maintained | Tiptap |
| React Quill | Heavy bundle (~40KB+ gzipped), WYSIWYG-only with limited styling control | Tiptap |
| Slate.js | Steeper learning curve, can be heavier for simple needs | Tiptap |
| CKEditor 5 | Enterprise-focused, complex licensing, heavy | Tiptap |
| Monaco Editor | Code editor, overkill for simple rich text | Tiptap |

---

## Integration with Existing Stack

### Redux / IndexedDB (No Schema Change)

The existing `noteText: string` in sessionSlice.ts can store HTML:

```typescript
// Current: noteText stores plain text
// After: noteText stores HTML string like "<p>Hello <strong>world</strong></p>"

// Tiptap API
editor.getHTML()    // Get HTML for storage
editor.setContent(html)  // Load HTML from storage
```

**Display in read-only contexts** (SessionSummary, HistoryDrawer):
```typescript
// Simple display with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: noteText }} />

// For clickable links in history, wrap with link styling
const NoteDisplay = styled.div`
  a {
    color: ${colors.primary};
    text-decoration: underline;
  }
`
```

### styled-components Integration

The existing NotePanel.tsx has toolbar UI that needs wiring:

```typescript
// Wire existing buttons to Tiptap commands
const editor  extensions: [
 = useEditor({
    StarterKit,
    Link.configure({ openOnClick: false })
  ],
  content: noteText,  // HTML string: ({ editor })
  onUpdate => {
    onNoteChange(editor.getHTML())
  }
})

// Connect toolbar buttons (existing BoldIcon, ListIcon, LinkIcon)
<ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}>
  <BoldIcon />
</ToolbarButton>

<ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
  <ListIcon />
</ToolbarButton>

// Link needs prompt or input for URL
<ToolbarButton onClick={() => {
  const url = window.prompt('Enter URL')
  if (url) editor.chain().focus().setLink({ href: url }).run()
}}>
  <LinkIcon />
</ToolbarButton>
```

### Replace TextArea with EditorContent

```typescript
// Before
<TextArea
  value={noteText}
  onChange={(e) => onNoteChange(e.target.value)}
  placeholder="Brainstorming..."
/>

// After
<NotesContainer>
  <Toolbar>...buttons...</Toolbar>
  <EditorContent editor={editor} />
</NotesContainer>
```

---

## Bundle Size Estimate

For bold + bullet list + links (minimal extensions):

| Package | Approx Gzipped |
|---------|----------------|
| @tiptap/react | ~8KB |
| @tiptap/starter-kit | ~15KB |
| @tiptap/extension-link | ~3KB |
| @tiptap/pm (peer dep) | ~30KB |
| **Total** | **~55KB** |

This is acceptable. React Quill alone is ~40KB+ and doesn't give you headless control.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| @tiptap/react | ^3.20.0 | React 18.x | React 19 in beta |
| @tiptap/starter-kit | ^3.20.0 | @tiptap/react ^3.20.0 | Includes core extensions |
| @tiptap/extension-link | ^3.20.0 | @tiptap/react ^3.20.0 | Requires @tiptap/pm |
| styled-components | ^6.3.10 | Already in project | Works with v6 |
| @reduxjs/toolkit | ^2.11.2 | Already in project | Compatible |

---

## Implementation Approach

### Step 1: Install Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

### Step 2: Create RichTextEditor Component

```typescript
// src/components/RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import styled from 'styled-components'

interface Props {
  content: string
  onChange: (html: string) => void
}

const EditorContainer = styled.div`
  .ProseMirror {
    min-height: 160px;
    padding: 16px;
    outline: none;

    p { margin: 0 0 0.5em 0; }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    strong { font-weight: bold; }
    a { color: #136dec; text-decoration: underline; }
  }
`

export function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  return <EditorContainer><EditorContent editor={editor} /></EditorContainer>
}
```

### Step 3: Wire Toolbar Buttons

In NotePanel.tsx, connect existing toolbar buttons to editor commands:
- Bold: `editor.chain().focus().toggleBold().run()`
- Bullet List: `editor.chain().focus().toggleBulletList().run()`
- Link: `editor.chain().focus().setLink({ href: url }).run()`

### Step 4: Display Formatted Notes

In SessionSummary.tsx and HistoryDrawer.tsx:
```typescript
const NoteDisplay = styled.div`
  .ProseMirror {
    /* Same styles as editor for consistency */
    a { color: #136dec; text-decoration: underline; }
  }
`

// Render stored HTML
<NoteDisplay dangerouslySetInnerHTML={{ __html: noteText }} />
```

---

## Sources

- npm view @tiptap/react --json — Package metadata, version 3.20.0
- npm view @tiptap/extension-link --json — Package metadata
- Project context: NotePanel.tsx shows existing toolbar UI (lines 454-464)
- Project context: SessionSummary.tsx, HistoryDrawer.tsx need read-only display

---

*Research for: Pomodoro Timer v2.3 Rich Text Session Notes*
*Researched: 2026-02-24*
