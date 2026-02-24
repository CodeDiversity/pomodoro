import { SessionRecord } from '../types/session';
import { saveSession } from '../services/sessionStore';

/**
 * Result of a CSV import operation
 */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Validate a single CSV row
 */
export function validateSessionRow(
  date: string,
  duration: string,
  mode: string
): { valid: boolean; error?: string } {
  // Required fields
  if (!date || date.trim() === '') {
    return { valid: false, error: 'Date is required' };
  }

  if (!duration || duration.trim() === '') {
    return { valid: false, error: 'Duration is required' };
  }

  // Duration must be a positive number
  const durationNum = parseInt(duration, 10);
  if (isNaN(durationNum) || durationNum <= 0) {
    return { valid: false, error: 'Duration must be a positive number' };
  }

  // Mode must be "focus"
  if (mode !== 'focus') {
    return { valid: false, error: 'Mode must be "focus"' };
  }

  return { valid: true };
}

/**
 * Parse CSV content and return validated session data
 */
export function parseCsvContent(csvContent: string): {
  sessions: Partial<SessionRecord>[];
  errors: string[];
} {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const sessions: Partial<SessionRecord>[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must have a header row and at least one data row');
    return { sessions, errors };
  }

  // Parse header row
  const header = lines[0].toLowerCase();
  const requiredColumns = ['date', 'duration', 'mode'];
  for (const col of requiredColumns) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { sessions, errors };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handle quoted fields)
    const values = parseCsvLine(line);

    if (values.length < 3) {
      errors.push(`Row ${i + 1}: Invalid number of columns`);
      continue;
    }

    const [date, duration, mode, notes = '', tags = ''] = values;

    // Validate the row
    const validation = validateSessionRow(date, duration, mode);
    if (!validation.valid) {
      errors.push(`Row ${i + 1}: ${validation.error}`);
      continue;
    }

    // Parse date to get timestamp (use noon to avoid timezone issues)
    const dateObj = new Date(date + 'T12:00:00.000Z');
    if (isNaN(dateObj.getTime())) {
      errors.push(`Row ${i + 1}: Invalid date format (use YYYY-MM-DD)`);
      continue;
    }

    // Parse tags (comma-separated)
    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [];

    // Create session record
    const startTimestamp = dateObj.toISOString();
    const endTimestamp = new Date(dateObj.getTime() + parseInt(duration, 10) * 1000).toISOString();

    sessions.push({
      startTimestamp,
      endTimestamp,
      plannedDurationSeconds: parseInt(duration, 10),
      actualDurationSeconds: parseInt(duration, 10),
      durationString: formatDuration(parseInt(duration, 10)),
      mode: 'focus' as const,
      startType: 'manual' as const,
      completed: true,
      noteText: notes || '',
      tags: tagsArray,
      taskTitle: '',
      createdAt: dateObj.getTime(),
    });
  }

  return { sessions, errors };
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get existing session timestamps for duplicate detection
 */
export async function getExistingTimestamps(): Promise<Set<string>> {
  const { getAllSessions } = await import('../services/sessionStore');
  const sessions = await getAllSessions();
  return new Set(sessions.map((s) => s.startTimestamp));
}

/**
 * Import sessions from a CSV file
 * @param file - CSV file to import
 * @returns ImportResult with counts and errors
 */
export async function parseCsvFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const { sessions, errors } = parseCsvContent(content);

      if (sessions.length === 0 && errors.length > 0) {
        resolve({
          imported: 0,
          skipped: errors.length,
          errors: errors,
        });
        return;
      }

      // Get existing timestamps for duplicate detection
      const existingTimestamps = await getExistingTimestamps();

      let imported = 0;
      let skipped = 0;
      const importErrors: string[] = [...errors];

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < sessions.length; i += batchSize) {
        const batch = sessions.slice(i, i + batchSize);

        for (const session of batch) {
          if (!session.startTimestamp) {
            skipped++;
            continue;
          }

          // Check for duplicate
          if (existingTimestamps.has(session.startTimestamp)) {
            skipped++;
            existingTimestamps.delete(session.startTimestamp); // Mark as seen
            continue;
          }

          // Create complete session record
          const sessionRecord: SessionRecord = {
            id: crypto.randomUUID(),
            startTimestamp: session.startTimestamp,
            endTimestamp: session.endTimestamp!,
            plannedDurationSeconds: session.plannedDurationSeconds!,
            actualDurationSeconds: session.actualDurationSeconds!,
            durationString: session.durationString!,
            mode: session.mode!,
            startType: session.startType!,
            completed: session.completed!,
            noteText: session.noteText || '',
            tags: session.tags || [],
            taskTitle: session.taskTitle || '',
            createdAt: session.createdAt!,
          };

          try {
            await saveSession(sessionRecord);
            imported++;
            existingTimestamps.add(session.startTimestamp);
          } catch (err) {
            importErrors.push(`Failed to save session: ${err}`);
            skipped++;
          }
        }

        // Small delay between batches to not block UI
        if (i + batchSize < sessions.length) {
          await new Promise((r) => setTimeout(r, 10));
        }
      }

      resolve({
        imported,
        skipped,
        errors: importErrors,
      });
    };

    reader.onerror = () => {
      resolve({
        imported: 0,
        skipped: 0,
        errors: ['Failed to read file'],
      });
    };

    reader.readAsText(file);
  });
}
