# Phase 14 Context: Data Export/Import

**Gathered:** 2026-02-24

## Design Decisions

### Export

- **[Decision 1] Export Button Placement**: Place export button in the History view header area, next to the existing filter controls in `HistoryFilterBar`. The filter bar already has search, date filter dropdown, and calendar button. An export button should be added to the right side of this bar.

- **[Decision 2] Date Format in CSV**: Use ISO 8601 date format (YYYY-MM-DD) for the date column. This is machine-readable, sortable, and unambiguous. Example: `2026-02-24`.

- **[Decision 3] Tag Format in CSV**: Use comma-separated values for tags (e.g., "work, project-alpha, important"). This is a simple, standard format that works well with spreadsheet applications. Empty tags should result in an empty string.

- **[Decision 4] Filename Format**: Follow the specified format `pomodoro-sessions-YYYY-MM-DD.csv`. The date should be the current date when export is triggered.

- **[Decision 5] Export Scope**: Export respects the current date range filter (today/7 days/30 days/all). The filtered sessions (not all sessions) should be exported. This aligns with user expectations - if they filter to "Last 7 Days", they likely want to export just those sessions.

- **[Decision 6] CSV Columns Order**: Columns should be: `date`, `duration` (in seconds), `mode`, `notes`, `tags`. Duration in seconds is unambiguous; users can convert if needed.

### Import

- **[Decision 1] Import Button Placement**: Place import button in the Settings view under the "Data" section, alongside the existing "Reset All Data" button. This is a logical location for data management actions.

- **[Decision 2] Duplicate Detection**: Use `startTimestamp` (ISO timestamp with milliseconds) as the unique identifier for duplicate detection. If a session with the same `startTimestamp` already exists, skip importing that record. This ensures exact duplicates are not created.

- **[Decision 3] Invalid Data Handling**: Validate each row before import:
  - Required fields: `date`, `duration`, `mode`
  - `duration` must be a positive number
  - `mode` must be "focus" (other modes not stored in history)
  - If a row is invalid, skip it and continue processing other rows
  - Show a summary after import: "Imported X sessions, skipped Y invalid/duplicate rows"

- **[Decision 4] Import Progress**: For large files, show a progress indicator. Process in batches of 50-100 sessions to avoid blocking the UI.

## Technical Considerations

- **SessionRecord Structure**: The existing `SessionRecord` type in `/src/types/session.ts` defines all fields. The CSV export should map these fields:
  - `startTimestamp` -> `date` (extract date portion)
  - `actualDurationSeconds` -> `duration`
  - `mode` -> `mode`
  - `noteText` -> `notes`
  - `tags` -> `tags` (comma-separated)

- **IndexedDB Access**: Use existing `sessionStore.ts` functions:
  - `getAllSessions()` for fetching sessions to export
  - `saveSession()` for importing sessions
  - No changes needed to IndexedDB schema (DB version 4)

- **Date Filter Integration**: The date filter state is managed in `historySlice.ts` via `setDateFilter`. Export should use the current filter value from Redux store or use `selectSessionsByDate` selector.

- **CSV Parsing**: Use a simple parser or library. The file picker should use `<input type="file" accept=".csv" />`.

- **File Download**: Use the standard approach of creating a Blob with MIME type `text/csv` and triggering download via a dynamically created anchor element.

## Questions Resolved

- **[Resolved question] Where should the export button be placed?**: In the History view, in the filter bar area, to the right of existing controls. This keeps it close to where users filter their data.

- **[Resolved question] What date format should be used in the CSV?**: ISO 8601 (YYYY-MM-DD) for dates. This is the most unambiguous and sortable format.

- **[Resolved question] Should tags be comma-separated or multi-value in the CSV?**: Comma-separated is simpler and more portable. Users can split in Excel/Sheets if needed.

- **[Resolved question] Where should the import button be located?**: In Settings, under the "Data" section, alongside the "Reset All Data" button.

- **[Resolved question] How should duplicates be detected?**: By matching `startTimestamp`. This is unique per session and the most reliable identifier.

- **[Resolved question] What happens if the CSV has invalid data?**: Skip invalid rows, continue processing valid ones, show a summary of results (imported count + skipped count).

## Open Questions

- **[Open question] Should the export include a header row?**: Yes, include headers (date, duration, mode, notes, tags) to make the CSV human-readable and importable by other tools.

- **[Open question] Should export include completed sessions only, or all sessions?**: The current History view shows all sessions (completed and incomplete). Export should match what the user sees - all sessions in the filtered range.

- **[Open question] How to handle timezone differences in imported dates?**: Store timestamps as-is in ISO 8601 format. Import should preserve the original timestamp exactly.

- **[Open question] Should there be a confirmation before overwriting duplicates?**: Currently planning to skip silently. A future enhancement could ask users whether to skip, overwrite, or import anyway.
