# Phase 18: Editor Infrastructure - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Install rich text dependencies (Tiptap, dompurify) and create foundation components with XSS sanitization. This includes RichTextDisplay for read-only rendering and handling legacy plain-text notes. The editor component (RichTextEditor with toolbar) comes in Phase 19.

</domain>

<decisions>
## Implementation Decisions

### Sanitization scope
- Use dompurify with strict configuration by default
- Allow basic formatting tags: strong, b, em, i, u, s, strike, ul, ol, li, p, br, a (with href)
- Strip all style attributes and inline CSS to prevent XSS via styles
- Add data attributes to allowlist if needed for editor state

### Component API
- RichTextDisplay accepts `content` prop — HTML string format (not Tiptap JSON)
- This aligns with how existing textarea stores notes (plain HTML string)
- Add optional `class` prop for custom styling overrides
- Render sanitized HTML via `{@html}` in Svelte

### Legacy handling
- Auto-detect: if content contains HTML tags, treat as rich text
- Plain text: escape HTML entities before rendering (prevents "<b>" showing as bold)
- Store metadata flag in note record: `isRichText: boolean` for clarity
- Display legacy plain-text notes as-is without transformation

### Rendered styling
- Use Tiptap ProseMirror CSS classes as base (tiptap p, tiptap ul, etc.)
- Apply minimal custom styling to match app aesthetic
- Typography: inherit from app's font family, adjust line-height for readability
- Links: use app's accent color, underline on hover

### Claude's Discretion
- Exact sanitization allowlist configuration
- Specific CSS rules for each element type (ul/ol indent, p margins)
- Error boundary handling for malformed HTML
- Performance considerations for large notes

</decisions>

<specifics>
## Specific Ideas

- "Make all decisions based on best practices" — user trusts implementation choices
- RichTextDisplay should be simple and focused on read-only rendering
- Keep Phase 18 scoped to infrastructure (no editor toolbar, no editing)

</specifics>

<deferred>
## Deferred Ideas

- RichTextEditor with toolbar — Phase 19
- NotePanel integration — Phase 20
- Read-only display in SessionSummary/HistoryDrawer — Phase 21

</deferred>

---

*Phase: 18-editor-infrastructure*
*Context gathered: 2026-02-24*
