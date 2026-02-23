# Project Research Summary

**Project:** Pomodoro Timer v2.2
**Domain:** React productivity app with streak tracking and data export
**Researched:** 2026-02-23
**Confidence:** HIGH (stack, architecture) / MEDIUM (features, pitfalls)

## Executive Summary

This research covers adding daily streak tracking and CSV export/import to an existing Pomodoro timer application. The key finding is that **no new dependencies are needed for streak calculation** — existing session timestamps in IndexedDB combined with native Date APIs are sufficient. For CSV handling, `papaparse` (^5.4.1) is recommended as the industry standard library.

The architecture approach is elegant: streak data is **purely derived from existing session data** via Redux selectors, requiring no new IndexedDB schema or Redux slice. This minimizes integration complexity. The main risks involve timezone handling and edge cases around midnight boundaries for streak calculation, and CSV format compatibility for re-import.

**Key risks:**
- Timezone handling breaks streak calculations for international users
- CSV import without duplicate detection creates duplicate sessions
- Large imports can block the UI thread

## Key Findings

### Recommended Stack

**Core technologies:**
- **papaparse (^5.4.1)** — CSV parsing/generation. Industry standard (12M+ weekly downloads), handles edge cases, TypeScript types included, no dependencies.
- **Custom styled-components** — Calendar grid for streak visualization. ~100 LOC, matches existing theme tokens, no bloat.
- **Native Date APIs** — Already used in `dateUtils.ts` and `statsUtils.ts`. Sufficient for streak logic (avoid adding date-fns/moment).

**What NOT to add:**
- react-big-calendar, react-datepicker — overkill
- date-fns, moment.js — unnecessary bundle bloat
- csv-parse / csv-stringify — lower level than papaparse

### Expected Features

**Must have (table stakes):**
- Current streak display — consecutive days with completed focus sessions
- Longest streak display — all-time best persisted in settings
- Export all sessions as CSV — single button downloads complete history
- Import CSV with validation — parse file, validate structure, insert valid rows

**Should have (competitive):**
- Calendar heatmap — visual grid showing activity per day
- Export filtered date range — align with existing history filters
- Import error reporting — show detailed errors for invalid rows

**Defer (v2+):**
- Streak milestones with celebration UI
- Daily session goal tracking
- Merge-on-import to avoid duplicates

### Architecture Approach

Streak tracking is purely derived from existing session data using memoized Redux selectors. No new IndexedDB schema required — sessions already have `createdAt` timestamps.

**Major components:**
1. `streakUtils.ts` — Pure functions: calculateCurrentStreak, calculateLongestStreak, getStreakDays
2. `historySelectors.ts` (extend) — Memoized selectors: selectStreakData, selectCurrentStreak, selectLongestStreak
3. `csvUtils.ts` — CSV serialization (sessionsToCSV) and parsing (csvToSessions with validation)
4. `ImportModal.tsx` — File picker + results display + import status in Redux

### Critical Pitfalls

1. **Timezone handling breaks streak calculations** — Users in different timezones see incorrect streaks. Use local date boundaries consistently, avoid UTC midnight assumptions.

2. **Streak resets at midnight** — Query sessions for both "today" and "yesterday" to handle midnight edge case. Show "last session: X hours ago" feedback.

3. **CSV export creates invalid files** — Use RFC 4180 compliant format, add BOM for Excel compatibility, escape quotes properly.

4. **CSV import creates duplicates** — Check for existing records before inserting. Generate import ID from timestamp + content hash.

5. **Large CSV imports block UI** — Process in chunks (50 sessions per transaction), show progress indicator, yield to UI.

6. **Streak calculation ignores session validity** — Only count completed focus sessions with minimum duration (e.g., 5 minutes).

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Streak Infrastructure
**Rationale:** Core feature — streak tracking is the primary v2.2 value proposition. Must get right before building UI.
**Delivers:** `streakUtils.ts` with pure calculation functions, memoized selectors, StreakCounter component.
**Addresses:** Current streak display, longest streak display, streak reset indicator.
**Avoids:** Timezone pitfalls (use local dates), session validity issues (minimum duration), midnight edge cases.

### Phase 2: Streak Calendar
**Rationale:** Visual component depends on streak infrastructure being complete.
**Delivers:** StreakCalendar component with heatmap visualization, calendar grid in History screen.
**Addresses:** Calendar heatmap feature.
**Avoids:** Rendering performance issues by showing only relevant months.

### Phase 3: CSV Export
**Rationale:** Export is simpler than import — one-way conversion. Validates CSV format before import work.
**Delivers:** Export button on History screen, sessionsToCSV utility.
**Addresses:** Export all sessions as CSV.
**Avoids:** Invalid CSV format pitfalls by using papaparse, BOM for Excel.

### Phase 4: CSV Import
**Rationale:** More complex — requires validation, duplicate detection, bulk IndexedDB writes.
**Delivers:** Import modal, bulkImportSessions in sessionStore, import status in Redux.
**Addresses:** Import CSV with validation, import error reporting.
**Avoids:** Duplicate sessions (ID check), UI freeze (chunked processing), re-import issues.

### Phase 5: Integration & Polish
**Rationale:** Final integration, edge case handling, UX refinement.
**Delivers:** Connect import to reload, error handling, edge cases.
**Addresses:** All remaining features, UX polish.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Streak):** Timezone edge cases need verification with actual timezone tests
- **Phase 4 (Import):** Large file handling may need research if datasets grow beyond 10k sessions

Phases with standard patterns (skip research-phase):
- **Phase 3 (Export):** Well-documented, papaparse handles edge cases
- **Phase 5 (Polish):** Standard UX patterns apply

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with npm/papaparse docs, existing codebase integration points identified |
| Features | MEDIUM | Based on common productivity app patterns; web search unavailable for verification |
| Architecture | HIGH | Detailed implementation patterns from ARCHITECTURE.md, existing Redux integration verified |
| Pitfalls | MEDIUM | Based on established patterns, some edge cases need real-world verification |

**Overall confidence:** HIGH

### Gaps to Address

- **Timezone testing:** Need to verify streak calculations work across UTC+12 and UTC-12 timezones before Phase 1 completes
- **Large dataset testing:** CSV import with 2000+ sessions needs manual testing to verify chunked processing
- **Feature flagging:** No research on whether streak should count break sessions — needs product decision

## Sources

### Primary (HIGH confidence)
- papaparse npm (v5.4.1) — CSV library
- Redux Toolkit Documentation — State management
- Existing codebase: `src/utils/dateUtils.ts`, `src/utils/statsUtils.ts`, `src/services/sessionStore.ts`

### Secondary (MEDIUM confidence)
- Common productivity app patterns (Duolingo streaks, GitHub contributions)
- Standard CSV export patterns (Blob + URL.createObjectURL)
- RFC 4180 — CSV format specification

### Tertiary (LOW confidence)
- Community patterns from streak tracker GitHub topics — needs validation during implementation

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
