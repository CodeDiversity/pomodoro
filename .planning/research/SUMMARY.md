# Project Research Summary

**Project:** Pomodoro Timer — Rich Text Session Notes (v2.3)
**Domain:** Productivity App — Rich Text Editor Integration
**Researched:** 2026-02-24
**Confidence:** HIGH

---

## Executive Summary

This research covers adding rich text editing (bold, bullet lists, clickable links) to session notes in an existing Pomodoro timer app. The recommended approach uses **Tiptap** (headless ProseMirror wrapper) with **HTML storage** format. This provides full UI control while maintaining simplicity: the editor produces HTML that stores directly in the existing `noteText` string field in IndexedDB, with no schema changes or Redux modifications required.

Key findings:
- **Tiptap** is the recommended editor library — headless, modular, built on ProseMirror (used by Google, Facebook), with excellent React 18+ support
- **Storage format**: HTML over JSON — simpler read-only rendering, no new IndexedDB schema
- **Bundle impact**: ~55KB gzipped — acceptable for feature set
- **Critical pitfalls**: XSS sanitization, rendering consistency between editor and display, legacy plain-text note handling

---

## Key Findings

### Recommended Stack

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|----------------|
| @tiptap/react | ^3.20.0 | React wrapper for Tiptap editor | Headless, full UI control. Built on ProseMirror. Active maintenance, strong TypeScript support. |
| @tiptap/starter-kit | ^3.20.0 | Basic extensions (bold, bullet list) | Tree-shakeable — only bundles what's used |
| @tiptap/extension-link | ^3.20.0 | Clickable hyperlink support | Required for link feature |
| dompurify | ^3.x | HTML sanitization | Required to prevent XSS attacks in displayed content |

**Core technologies:**
- **Tiptap:** Industry-standard editor (ProseMirror-based) — headless architecture gives full UI control
- **HTML storage:** Stores directly in existing `noteText: string` — no Redux changes, no migration needed
- **RichTextDisplay component:** Shared read-only renderer for SessionSummary, HistoryDrawer

### Expected Features

**Must have (table stakes):**
- Bold toolbar button — Wraps selection in `**`, toggle removes
- Bold rendering (modal + history) — Parse and display bold in edit/read mode
- Bullet toolbar button — Convert line to `- ` prefix
- Bullet rendering (modal + history) — Display as visual list
- Link toolbar button — Prompt for URL, wrap selection
- Clickable links (modal + history) — Render as interactive anchor

**Should have (competitive):**
- Keyboard shortcuts — Cmd/Ctrl+B for bold
- Visual toolbar state — Highlight active format button

**Defer (v2+):**
- Italic, underline, strikethrough
- Nested bullets
- Checklists
- Inline code

### Architecture Approach

The architecture leverages existing components and requires no schema changes:

- **Storage:** HTML string in existing `noteText` field (no IndexedDB changes)
- **Redux:** No changes — `noteText` remains a string
- **Components:**
  - `RichTextEditor.tsx` — Tiptap-based editor with toolbar
  - `RichTextDisplay.tsx` — Read-only HTML renderer with sanitization
  - NotePanel.tsx — Replace textarea with RichTextEditor
  - SessionSummary.tsx — Replace text display with RichTextDisplay
  - HistoryDrawer.tsx — Toggle between RichTextDisplay (view) and RichTextEditor (edit)

### Critical Pitfalls

1. **HTML Storage Without Sanitization** — Stored HTML is an XSS vector. Use `dompurify` on ALL display paths (modal, history, export). Never use raw `dangerouslySetInnerHTML`.

2. **Inconsistent Rendering Between Editor and Display** — Text looks formatted in editor but loses formatting in session modal or history drawer. Create a shared `RichTextDisplay` component used everywhere.

3. **Breaking Existing Plain Text Notes** — Existing notes are plain text. Rich text editor must handle plain text gracefully on load. Default to plain text mode for legacy notes until first edit.

4. **Link Rendering Inconsistency** — Links work in editor but show as plain text in history/details views. Use consistent link component with `rel="noopener noreferrer"`.

5. **React 18/19 Compatibility** — Many rich text libraries use deprecated `findDOMNode`. Verify Tiptap compatibility early — it supports React 18+.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Editor Infrastructure & Security
**Rationale:** Foundation must be secure and handle legacy data first. Cannot proceed without sanitization.
**Delivers:**
- Install Tiptap dependencies + dompurify
- Create `RichTextDisplay.tsx` (read-only, sanitized)
- Unit tests for sanitization
**Addresses:** P1 features (bold/bullet/link rendering in modal)
**Avoids:** Pitfall #1 (XSS), Pitfall #3 (legacy notes break)

### Phase 2: Editor Component
**Rationale:** Editor must exist before integration
**Delivers:**
- Create `RichTextEditor.tsx` wrapper
- Wire toolbar actions (toggleBold, toggleBulletList, setLink)
- Handle placeholder text
**Addresses:** Toolbar button functionality
**Avoids:** Pitfall #4 (React compatibility — verify Tiptap works)

### Phase 3: NotePanel Integration
**Rationale:** Active session is primary use case
**Delivers:**
- Replace textarea in NotePanel.tsx with RichTextEditor
- Wire existing toolbar buttons to editor commands
- Style for active states
**Addresses:** Session modal rich text editing
**Avoids:** Pitfall #2 (inconsistency — use RichTextDisplay for read-only)

### Phase 4: Read-Only Display Integration
**Rationale:** SessionSummary and HistoryDrawer need read-only rendering
**Delivers:**
- Update SessionSummary.tsx with RichTextDisplay
- Update HistoryDrawer.tsx with view/edit toggle
- Handle empty content gracefully
**Addresses:** Display in modal and history
**Avoids:** Pitfall #2 (inconsistent rendering), Pitfall #4 (link rendering)

### Phase 5: Polish & Validation
**Rationale:** Final integration verification
**Delivers:**
- Verify dompurify configured correctly
- Test link rendering in all views (modal, drawer, export)
- Test legacy plain-text notes
- Add keyboard shortcuts
**Avoids:** All pitfalls — comprehensive testing

### Phase Ordering Rationale

- **Security first:** Sanitization must be part of Phase 1, not added later
- **Display before editor:** RichTextDisplay has no dependencies, can be built and tested independently
- **Integration at end:** NotePanel and HistoryDrawer integration comes after both components exist
- **Avoids pitfalls:** Each phase explicitly addresses identified risks

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (NotePanel Integration):** Complex component with existing toolbar UI — may need UI/UX research for toolbar styling
- **Phase 4 (HistoryDrawer):** Toggle state management — verify existing patterns work

Phases with standard patterns (skip research-phase):
- **Phase 1 (Editor Infrastructure):** Well-documented Tiptap patterns, dompurify standard usage
- **Phase 2 (Editor Component):** Standard Tiptap React integration

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Tiptap is industry standard, version 3.20.0 verified via npm |
| Features | HIGH | Table stakes well-documented across Notion/Obsidian/Keep |
| Architecture | HIGH | Zero schema changes, clear component boundaries |
| Pitfalls | MEDIUM | XSS/inconsistency patterns known from Quill/Tiptap issues |

**Overall confidence:** HIGH

### Gaps to Address

- **Mobile toolbar UX:** Not deeply researched — toolbar may be unusable on mobile. Consider bubble menu if issues arise.
- **Character limit validation:** Project has 2000 char limit — current logic counts HTML length, not visible text. Verify during Phase 5.

---

## Sources

### Primary (HIGH confidence)
- Tiptap Official Documentation — https://tiptap.dev/docs/editor
- npm view @tiptap/react — Version 3.20.0 verified
- DOMPurify GitHub — https://github.com/cure53/DOMPurify

### Secondary (MEDIUM confidence)
- React-Quill GitHub Issues — SSR problems, list numbering bugs (avoided by using Tiptap)
- Tiptap GitHub Issues — Mobile Safari issues, React integration (minor concerns)
- Notion/Obsidian UX patterns — Feature parity expectations

### Tertiary (LOW confidence)
- None — all key sources verified

---

*Research completed: 2026-02-24*
*Ready for roadmap: yes*
