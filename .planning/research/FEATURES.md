# Feature Research: Rich Text Session Notes

**Domain:** Rich text editing for productivity app session notes (v2.3)
**Researched:** 2026-02-24
**Confidence:** HIGH (based on common productivity app UX patterns)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any productivity app with rich text. Missing these = confusing or broken UX.

#### Bold Text

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Bold toolbar button** | Standard pattern (Ctrl/Cmd+B, toolbar icon) | LOW | Toggle behavior: click with selection wraps in `**`, click again removes |
| **Bold rendering in modal** | Visual feedback during editing | LOW | Parse `**text**` → bold styling in edit mode |
| **Bold rendering in history** | Previously saved notes must show formatting | LOW | Same rendering as modal, read-only |
| **Markdown storage** | Format persists across sessions | LOW | Store as `**bold**` in noteText field |

#### Bullet Lists

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Bullet toolbar button** | Standard pattern for outlining | LOW | Toggle: converts line to `- ` prefix, again removes |
| **Bullet rendering in modal** | Visual list while editing | LOW | Parse `- ` lines → styled list items |
| **Bullet rendering in history** | Saved lists display correctly | LOW | Same as modal, read-only |
| **Auto-continue bullets** | Pressing Enter continues list | LOW | Common pattern in Notion/Obsidian |

#### Links

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Link insertion button** | Standard pattern for URLs | MEDIUM | Dialog or inline prompt for URL input |
| **Clickable links in modal** | Interactive URLs in edit mode | LOW | Render as clickable anchor |
| **Clickable links in history** | Links work in history drawer | LOW | Same as modal |
| **Link storage** | Format persists | LOW | Store as `[text](url)` in noteText |

---

### Differentiators (Competitive Advantage)

Features that could set this app apart. Not required, but add polish.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Keyboard shortcuts** | Power user efficiency (Cmd+B for bold) | LOW | Standard shortcuts accelerate workflow |
| **Auto-detect URLs** | Type URL without toolbar | MEDIUM | Regex detection of http/https URLs |
| **Visual toolbar state** | Show active format on button | MEDIUM | Requires selection state tracking |
| **Placeholder hints** | Guide users to formatting | LOW | "Use **text** for bold" |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Rich text in search** | See formatted matches | Complex highlighting, re-parsing | Plain text search, full note shows formatting |
| **Nested bullets** | Complex outlines | UI complexity, storage change | Single-level bullets sufficient |
| **Full WYSIWYG editor** | Word-like experience | Library needed, scope creep | Simple toolbar + markdown |
| **Inline code** | Technical notes | Beyond stated v2.3 goal | Defer to future |

---

## Feature Dependencies

```
[Rich Text Storage Format]
    └──requires──> [Bold Rendering (modal + history)]
                      └──requires──> [Bold Toolbar Button]

[Rich Text Storage Format]
    └──requires──> [Bullet Rendering (modal + history)]
                      └──requires──> [Bullet Toolbar Button]

[Rich Text Storage Format]
    └──requires──> [Link Rendering (modal + history)]
                      └──requires──> [Link Insertion UI]
```

### Dependency Notes

- **Storage format is foundational:** Use markdown (`**bold**`, `- bullet`, `[text](url)`) - human-readable, portable
- **Display must come before toolbar:** Users expect WYSIWYG in modal; toolbar creates the format
- **All three share storage:** Markdown format handles all three simultaneously
- **Integration with autosave:** Existing autosave must preserve formatting

---

## MVP Definition

### Launch With (v2.3)

Core rich text features for milestone completion.

- [ ] **Bold toolbar button** — Wraps selection in `**`, toggle removes
- [ ] **Bold rendering (modal)** — Parse and display bold in edit mode
- [ ] **Bold rendering (history)** — Parse and display bold in read mode
- [ ] **Bullet toolbar button** — Convert line to `- ` prefix
- [ ] **Bullet rendering (modal)** — Display as visual list in edit mode
- [ ] **Bullet rendering (history)** — Display as visual list in read mode
- [ ] **Link toolbar button** — Prompt for URL, wrap selection
- [ ] **Clickable links (modal)** — Render as interactive anchor
- [ ] **Clickable links (history)** — Links work in history drawer
- [ ] **Storage format** — noteText preserves markdown

### Add After Validation (v2.3.x)

Nice-to-have polish.

- [ ] **Keyboard shortcuts** — Cmd/Ctrl+B for bold
- [ ] **Visual toolbar state** — Highlight active format button

### Future Consideration (v3.0+)

Beyond current scope.

- [ ] Italic, underline, strikethrough
- [ ] Nested bullets
- [ ] Checklists
- [ ] Inline code

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Bold toolbar button | HIGH | LOW | P1 |
| Bold rendering (modal + history) | HIGH | LOW | P1 |
| Bullet toolbar button | HIGH | LOW | P1 |
| Bullet rendering (modal + history) | HIGH | LOW | P1 |
| Link toolbar button | HIGH | MEDIUM | P1 |
| Clickable links (modal + history) | HIGH | LOW | P1 |
| Keyboard shortcuts | MEDIUM | LOW | P2 |
| Visual toolbar state | LOW | MEDIUM | P2 |
| Auto-detect URLs | LOW | MEDIUM | P2 |

**Priority key:**
- P1: Must have for v2.3 launch
- P2: Should have, add when possible
- P3: Nice to have, future

---

## Rich Text UX Patterns

### Toolbar Button Behavior

#### Bold Button
- **With selection:** Click wraps selection in `**`
- **On bold text:** Click removes `**` (toggle)
- **No selection:** Click inserts `**` at cursor, cursor between markers

#### Bullet Button
- **With selection:** Click prepends `- ` to that line
- **On bullet line:** Click removes `- ` (toggle off)
- **Enter at end of bullet:** Auto-insert new `- ` (continues list)
- **Enter on blank line:** Exit bullet list

#### Link Button
- **With selection:** Click opens prompt/dialog for URL
- **After input:** Wrap as `[selected text](url)`
- **No selection:** Insert `[](url)` and prompt

### Display Rendering

| Scenario | Display | Implementation |
|----------|---------|----------------|
| `**bold**` | **bold** | Parse and apply font-weight: bold |
| `****` (empty) | Empty or literal | Handle gracefully, no crash |
| `**unclosed` | Plain `**unclosed` | Parser handles invalid |
| `- item` | • item | Render with bullet style |
| `- ` (empty) | Empty or ignore | Filter empties |
| `[text](url)` | text (clickable) | Render as `<a>` |

### Edge Cases Summary

| Scenario | Expected | Notes |
|----------|----------|-------|
| Empty bold `****` | Empty | Don't crash |
| Unclosed bold `**text` | Plain text | Invalid markdown |
| Empty bullet `- ` | Empty or skip | Be consistent |
| Empty link `[](url)` | Show URL or empty | Decide UX |
| Invalid URL `[text](bad)` | Styled as link | Allow any input |
| Mixed: `**bold** + - bullet` | Both render | Parser handles |

---

## Storage & Implementation

### Recommended: Markdown Storage

| Approach | Example | Pros | Cons |
|----------|---------|------|------|
| **Markdown** | `**bold**`, `- item`, `[](url)` | Portable, readable, Notion/Obsidian aligned | Must parse on display |
| HTML | `<strong>bold</strong>`, `<ul>` | Direct rendering | Less readable |

**Choose markdown because:**
- Human-readable for debugging
- Portable for CSV export/import
- Users familiar from Notion/Obsidian
- Easy to parse with regex or library

### Integration with Existing Code

From PROJECT.md context:
- `noteText` field in SessionRecord (IndexedDB)
- Session modal — needs toolbar (edit mode)
- History drawer — needs rendering (read mode)
- Autosave — preserve formatting on change

### Dependencies on Existing Features

| Existing Feature | Rich Text Usage |
|-----------------|-----------------|
| noteText field | Stores markdown format |
| Autosave | Preserves formatting |
| Tags system | Independent, no conflict |
| Session recording | Formatted notes saved |
| History filtering | Works on plain text |

---

## Competitor Analysis

| Feature | Notion | Obsidian | Google Keep | Our Approach |
|---------|--------|----------|-------------|--------------|
| Bold | Yes | Yes | Yes | Match pattern |
| Bullets | Yes | Yes | Yes | Match pattern |
| Links | Yes | Yes | Yes | Match pattern |
| Keyboard shortcuts | Yes | Yes | No | Add for power users |
| Auto-detect URLs | Yes | Plugin | Yes | Future |

**Our approach:** Match industry standards. Users familiar with Notion/Obsidian will feel at home.

---

## Sources

- Productivity app UX patterns: Notion, Obsidian, Evernote, Google Keep
- Markdown syntax: CommonMark specification
- Web Content Accessibility Guidelines (WCAG) for accessible links
- Existing code: SessionRecord type, noteText field, modal/drawer components

---

*Feature research for: Rich Text Session Notes (v2.3)*
*Researched: 2026-02-24*
