# Roadmap: Pomodoro Timer

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-02-19)
- ✅ **v2.0 Redesign** — Phases 5-12 (shipped 2026-02-21)
- ✅ **v2.1 Features** — Phases 7-12 additions (shipped 2026-02-23)
- ✅ **v2.2 Features** — Phases 13-17 (shipped 2026-02-24)
- 📋 **v2.3 Rich Text Notes** — Phases 18-22 (planning)

---

## Phases

- [x] **Phase 18: Editor Infrastructure** — Install Tiptap, create RichTextDisplay with sanitization, handle legacy notes
- [ ] **Phase 19: Editor Component** — Create RichTextEditor with Bold, Bullet, Link toolbar buttons
- [ ] **Phase 20: NotePanel Integration** — Replace textarea with RichTextEditor in active session
- [ ] **Phase 21: Read-Only Display** — Update SessionSummary and HistoryDrawer with RichTextDisplay
- [ ] **Phase 22: Polish & Validation** — Keyboard shortcuts, cross-component testing, final verification

---

## Phase Details

### Phase 18: Editor Infrastructure
**Goal:** Install rich text dependencies and create foundation components with XSS sanitization

**Depends on:** Nothing (first v2.3 phase)

**Requirements:** INF-01, INF-02, INF-03

**Success Criteria** (what must be TRUE):
1. Tiptap dependencies installed without conflicts (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link)
2. dompurify installed and configured for HTML sanitization
3. RichTextDisplay component renders sanitized HTML in read-only mode
4. Existing plain-text notes display correctly without formatting artifacts
5. Session notes autosave preserves rich text formatting

**Plans:** 1/1 plans complete

Plan:
- [x] 18-01-PLAN.md — Install dependencies and create RichTextDisplay with sanitization

---

### Phase 19: Editor Component
**Goal:** Create RichTextEditor component with functional toolbar buttons

**Depends on:** Phase 18

**Requirements:** RTE-01, RTE-02, RTE-03, RTE-04, RTE-05

**Success Criteria** (what must be TRUE):
1. RichTextEditor renders in place of standard textarea
2. Bold toolbar button toggles bold formatting on selected text
3. Bullet list toolbar button toggles bullet list on current line
4. Link toolbar button prompts for URL and inserts clickable link
5. Toolbar buttons display in a styled row above the editor

**Plans:** 1/1 plans

Plan:
- [ ] 19-01-PLAN.md — Create RichTextEditor with Bold, Bullet, Link toolbar

---

### Phase 20: NotePanel Integration
**Goal:** Replace textarea in NotePanel with RichTextEditor during active sessions

**Depends on:** Phase 19

**Requirements:** RTE-04, RTE-05

**Success Criteria** (what must be TRUE):
1. Active Focus session shows RichTextEditor instead of plain textarea
2. Toolbar buttons (Bold, Bullet, Link) appear in NotePanel
3. Editing a note and saving preserves formatting in IndexedDB
4. Session summary modal displays formatted note after session ends

**Plans:** TBD

---

### Phase 21: Read-Only Display Integration
**Goal:** Display formatted notes in SessionSummary modal and History details drawer

**Depends on:** Phase 18 (RichTextDisplay component)

**Requirements:** RTD-01, RTD-02, RTD-03, RTD-04, RTD-05, RTD-06

**Success Criteria** (what must be TRUE):
1. Session summary modal displays bold text correctly after session completion
2. Session summary modal displays bullet lists correctly after session completion
3. Session summary modal displays clickable links after session completion
4. History details drawer displays bold text correctly in view mode
5. History details drawer displays bullet lists correctly in view mode
6. History details drawer displays clickable links in view mode

**Plans:** TBD

---

### Phase 22: Polish & Validation
**Goal:** Final integration verification, keyboard shortcuts, and edge case handling

**Depends on:** Phase 20 and Phase 21

**Requirements:** All remaining v2.3 requirements

**Success Criteria** (what must be TRUE):
1. Cmd/Ctrl+B keyboard shortcut toggles bold in editor
2. Links rendered in modal open in new tab with proper security attributes
3. Legacy plain-text notes (pre-v2.3) render without HTML artifacts
4. Character limit validation works correctly with HTML content
5. All v2.3 features functional in a clean browser test

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1-4 (v1.0) | Complete | Shipped | 2026-02-19 |
| 5-12 (v2.0) | Complete | Shipped | 2026-02-21 |
| 7-12 (v2.1) | Complete | Shipped | 2026-02-23 |
| 13-17 (v2.2) | Complete | Shipped | 2026-02-24 |
| 18 - Editor Infrastructure | 1/1 | Complete    | 2026-02-24 |
| 19 - Editor Component | 0/1 | Not started | - |
| 20 - NotePanel Integration | 0/1 | Not started | - |
| 21 - Read-Only Display | 0/1 | Not started | - |
| 22 - Polish & Validation | 0/1 | Not started | - |

---

*Next: /gsd:plan-phase 18*
