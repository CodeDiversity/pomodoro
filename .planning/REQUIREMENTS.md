# Requirements: Pomodoro Timer

**Defined:** 2026-02-24
**For milestone:** v2.3 Rich Text Notes

---

## v2.3 Requirements (In Progress)

### Rich Text Editor

- [x] **RTE-01**: User can toggle bold formatting via toolbar button
- [x] **RTE-02**: User can toggle bullet list formatting via toolbar button
- [x] **RTE-03**: User can insert links via toolbar button with URL input
- [ ] **RTE-04**: Rich text editor replaces textarea in NotePanel during active session
- [ ] **RTE-05**: Toolbar buttons (Bold, Bullet, Link) are functional and styled

### Rich Text Display

- [ ] **RTD-01**: Session notes display bold text correctly in session summary modal
- [ ] **RTD-02**: Session notes display bullet lists correctly in session summary modal
- [ ] **RTD-03**: Session notes display clickable links in session summary modal
- [ ] **RTD-04**: Session notes display bold text correctly in history details drawer
- [ ] **RTD-05**: Session notes display bullet lists correctly in history details drawer
- [ ] **RTD-06**: Session notes display clickable links in history details drawer

### Infrastructure

- [x] **INF-01**: Rich text display components sanitize HTML to prevent XSS
- [x] **INF-02**: Existing plain-text notes render correctly without formatting
- [x] **INF-03**: Session notes autosave preserves rich text formatting

---

## v2.2 Validated (Shipped 2026-02-24)

### Streak Tracking

- [x] **STRK-01**: Current streak displayed in header/stats view
- [x] **STRK-02**: Best (longest) streak tracked and displayed
- [x] **STRK-03**: Streak calculated based on consecutive days with focus sessions (minimum 5 minutes)
- [x] **STRK-04**: Streak calendar view showing monthly grid with daily activity
- [x] **STRK-05**: Calendar color coding: light blue (1-2 sessions) -> dark blue (5+ sessions)
- [x] **STRK-06**: Streak protection: 1 free miss allowed for 5+ day streaks
- [x] **STRK-07**: Streak data persisted to IndexedDB

### Data Export

- [x] **EXPT-01**: Export button in History view
- [x] **EXPT-02**: Date range filter for export (today/7 days/30 days/all)
- [x] **EXPT-03**: CSV format with columns: date, duration, mode, notes, tags
- [x] **EXPT-04**: Filename: pomodoro-sessions-YYYY-MM-DD.csv
- [x] **EXPT-05**: Download triggers browser file download

### Data Import

- [x] **IMPT-01**: Import button in Settings view
- [x] **IMPT-02**: File picker accepts CSV files exported from app
- [x] **IMPT-03**: Import validates CSV format and required columns
- [x] **IMPT-04**: Imported sessions merged with existing (no duplicates based on ID)
- [x] **IMPT-05**: Import progress shown with success/error feedback

---

## Out of Scope (v2.3)

| Feature | Reason |
|---------|--------|
| Italic, underline, strikethrough | Beyond v2.3 rich text goal |
| Nested bullet lists | UI complexity, single-level sufficient |
| Checklists | Not requested for v2.3 |
| Rich text in search | Requires complex highlighting |
| Auto-detect URLs | Requires regex detection, defer to future |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INF-01 | Phase 18 | Complete |
| INF-02 | Phase 18 | Complete |
| INF-03 | Phase 18 | Complete |
| RTE-01 | Phase 19 | Complete |
| RTE-02 | Phase 19 | Complete |
| RTE-03 | Phase 19 | Complete |
| RTE-04 | Phase 20 | Planned |
| RTE-05 | Phase 20 | Planned |
| RTD-01 | Phase 21 | Pending |
| RTD-02 | Phase 21 | Pending |
| RTD-03 | Phase 21 | Pending |
| RTD-04 | Phase 21 | Pending |
| RTD-05 | Phase 21 | Pending |
| RTD-06 | Phase 21 | Pending |

**Coverage:**
- v2.3 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 after v2.3 roadmap created*
