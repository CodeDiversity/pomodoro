import { SessionRecord } from '../types/session';
import { DateFilter, getDateRange } from './dateUtils';

/**
 * Convert a session to CSV row format
 */
function sessionToCsvRow(session: SessionRecord): string {
  const date = new Date(session.startTimestamp);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const duration = session.actualDurationSeconds;
  const mode = session.mode;
  const notes = session.noteText.replace(/"/g, '""'); // Escape quotes
  const tags = session.tags.join(', ');

  return `${dateStr},${duration},${mode},"${notes}","${tags}"`;
}

/**
 * Generate CSV content from sessions
 */
function generateCsvContent(sessions: SessionRecord[]): string {
  const header = 'date,duration,mode,notes,tags';
  const rows = sessions.map(sessionToCsvRow);
  return [header, ...rows].join('\n');
}

/**
 * Filter sessions by date range
 */
function filterSessionsByDate(sessions: SessionRecord[], dateFilter: DateFilter): SessionRecord[] {
  if (dateFilter === 'all') {
    return sessions;
  }

  const range = getDateRange(dateFilter);
  if (!range) {
    return sessions;
  }

  return sessions.filter((session) => {
    const sessionDate = new Date(session.startTimestamp);
    return sessionDate >= range.start && sessionDate <= range.end;
  });
}

/**
 * Export sessions to CSV file
 * @param sessions - Array of sessions to export
 * @param dateFilter - Current date filter to apply
 */
export function exportSessionsToCsv(sessions: SessionRecord[], dateFilter: DateFilter): void {
  // Filter sessions by date range (respects current filter)
  const filteredSessions = filterSessionsByDate(sessions, dateFilter);

  if (filteredSessions.length === 0) {
    console.warn('No sessions to export');
    return;
  }

  // Generate CSV content
  const csvContent = generateCsvContent(filteredSessions);

  // Create Blob with CSV MIME type
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Generate filename with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `pomodoro-sessions-${today}.csv`;

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}
