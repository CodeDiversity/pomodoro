# Pitfalls Research: v2.2 Features (Streak & Export/Import)

**Domain:** Pomodoro Timer Web App - Streak Tracking & Data Export/Import
**Researched:** 2026-02-23
**Confidence:** MEDIUM (based on established patterns, web search unavailable for verification)

## Critical Pitfalls

### Pitfall 1: Timezone Handling Breaks Streak Calculations

**What goes wrong:**
Users in different timezones see incorrect streaks, or streaks reset unexpectedly when crossing midnight. A user completes a session at 11:30 PM in their local timezone, but the app records it as the next day's session due to UTC conversion issues.

**Why it happens:**
- Storing timestamps in UTC but calculating "today" using local date boundaries
- Server/client timezone mismatch (not applicable here - client-only app)
- JavaScript's `Date` object behavior with timezone offsets
- Daylight saving time transitions causing midnight to shift

**How to avoid:**
1. Store timestamps as UTC ISO strings
2. Use a date library (date-fns, dayjs) with explicit timezone handling
3. Calculate streak days using the user's local timezone consistently

```typescript
// CORRECT: Use local date boundaries for streak calculation
import { startOfDay, isYesterday, format } from 'date-fns';

function getStreakDays(sessions: Session[]): number {
  const uniqueDays = new Set(
    sessions.map(s => format(new Date(s.timestamp), 'yyyy-MM-dd'))
  );
  // Sort and count consecutive days
  // ...
}

// WRONG: UTC midnight doesn't match user's midnight
const utcMidnight = new Date();
utcMidnight.setUTCHours(0, 0, 0, 0);
```

**Warning signs:**
- Streak shows "0" after completing a session
- Calendar view shows sessions on wrong dates
- Users in late-night timezones report issues

**Phase to address:**
Streak Implementation Phase (Phase 1 of v2.2)

---

### Pitfall 2: Streak Resets at Midnight Even With Today's Session

**What goes wrong:**
A user completes a session at 11:59 PM, then another at 12:01 AM the next day. The streak shows as "2 days" but should show as continuing (same user activity spanning midnight).

**Why it happens:**
Naive implementation treats each calendar day as a discrete unit without considering the session timestamps around midnight boundaries.

**How to avoid:**
1. Query sessions for both "today" and "yesterday" to handle midnight edge case
2. Display clear feedback: "1 day - last session: X hours ago"
3. Show "streak active" indicator for sessions completed within 48 hours

```typescript
// Handle midnight edge case
function hasRecentSession(sessions: Session[]): boolean {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd');

  const hasToday = sessions.some(s => format(new Date(s.timestamp), 'yyyy-MM-dd') === today);
  const hasYesterday = sessions.some(s => format(new Date(s.timestamp), 'yyyy-MM-dd') === yesterday);

  return hasToday || hasYesterday;
}
```

**Warning signs:**
- Inconsistent streak counts around midnight
- User complaints about "losing" a day in their streak

**Phase to address:**
Streak Implementation Phase (Phase 1 of v2.2)

---

### Pitfall 3: CSV Export Creates Invalid Files for Re-import

**What goes wrong:**
Users export their history, then cannot re-import it. The CSV has encoding issues, missing columns, or formatting that doesn't match the import expectations.

**Why it happens:**
- Using inconsistent date formats (ISO 8601 vs localized)
- Not escaping commas or newlines in notes/tags
- Missing BOM (Byte Order Mark) for UTF-8 in Excel
- Exporting internal IDs that conflict on import
- No header row or incorrect column names

**How to avoid:**
1. Use RFC 4180 compliant CSV format
2. Always include BOM for UTF-8: `\uFEFF`
3. Escape quotes: wrap fields containing commas/quotes in quotes, double internal quotes
4. Use ISO 8601 dates (YYYY-MM-DDTHH:MM:SSZ)
5. Include version header for future schema changes

```typescript
// Proper CSV escaping
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Export with BOM for Excel compatibility
function exportToCSV(sessions: Session[]): void {
  const BOM = '\uFEFF';
  const header = 'timestamp,duration,type,note,tags';
  const rows = sessions.map(s =>
    [s.timestamp, s.duration, s.type, escapeCSVField(s.note), s.tags.join(';')].join(',')
  );
  const csv = BOM + [header, ...rows].join('\n');
  // Trigger download
}
```

**Warning signs:**
- Exported CSV fails to open in Excel
- Import shows "0 sessions imported" or errors
- Special characters (emojis, accents) display incorrectly

**Phase to address:**
CSV Export/Import Phase (Phase 2 of v2.2)

---

### Pitfall 4: CSV Import Creates Duplicate Sessions

**What goes wrong:**
Users import the same file twice, resulting in duplicate sessions. Or, sessions imported from backup overwrite existing data unexpectedly.

**Why it happens:**
- No duplicate detection based on timestamp + duration + note hash
- Import doesn't check for existing sessions
- No "merge" strategy for conflicting data
- Missing import mode options (append vs replace)

**How to avoid:**
1. Generate import ID from timestamp + content hash
2. Check for existing records before inserting
3. Offer import modes: "Add only new", "Replace all", "Merge"
4. Show preview: "Found X new sessions, Y duplicates will be skipped"

```typescript
// Detect duplicates
function isDuplicate(newSession: Session, existing: Session[]): boolean {
  return existing.some(existing =>
    existing.timestamp === newSession.timestamp &&
    existing.duration === newSession.duration &&
    existing.note === newSession.note
  );
}

// Or use a content hash
function generateSessionHash(s: Session): string {
  return hash(`${s.timestamp}-${s.duration}-${s.note}`);
}
```

**Warning signs:**
- History shows duplicate entries after import
- User reports "my sessions doubled"
- No feedback about duplicates during import

**Phase to address:**
CSV Export/Import Phase (Phase 2 of v2.2)

---

### Pitfall 5: Large CSV Imports Block the UI

**What goes wrong:**
Importing a large history file (1000+ sessions) freezes the browser. The app becomes unresponsive during the import process.

**Why it happens:**
- Processing all rows synchronously in one JavaScript tick
- Bulk IndexedDB operations without batching
- No progress feedback, leading users to think it crashed

**How to avoid:**
1. Process in chunks using requestAnimationFrame or setTimeout
2. Batch IndexedDB writes (e.g., 50 sessions per transaction)
3. Show progress indicator: "Importing... 250/1000"
4. Use Web Workers for heavy processing (if needed)

```typescript
// Chunked import with progress
async function importSessions(sessions: Session[], onProgress: (n: number) => void): Promise<void> {
  const CHUNK_SIZE = 50;

  for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
    const chunk = sessions.slice(i, i + CHUNK_SIZE);

    await db.transaction('rw', db.sessions, async () => {
      for (const session of chunk) {
        if (!isDuplicate(session)) {
          await db.sessions.add(session);
        }
      }
    });

    onProgress(Math.min(i + CHUNK_SIZE, sessions.length));
    await new Promise(r => setTimeout(r, 0)); // Yield to UI
  }
}
```

**Warning signs:**
- "Page Unresponsive" warning during import
- Progress bar stuck at 0%
- Import appears to hang

**Phase to address:**
CSV Export/Import Phase (Phase 2 of v2.2)

---

### Pitfall 6: Streak Calculation Ignores Session Validity

**What goes wrong:**
A 1-second "fake" session counts towards the streak. Users game the system by starting and immediately stopping the timer. Or, very short sessions are counted but shouldn't be.

**Why it happens:**
- No minimum session duration threshold for streak credit
- No validation that session was actually completed
- Counting break sessions as streak contributors (or not, depending on requirements)

**How to avoid:**
1. Define minimum focus duration for streak credit (e.g., 5 minutes)
2. Only count "completed" sessions (reached timer end naturally)
3. Document streak rules clearly in UI

```typescript
// Only count valid focus sessions
const MIN_STREAK_DURATION = 5 * 60 * 1000; // 5 minutes

function isValidForStreak(session: Session): boolean {
  return session.type === 'focus' &&
         session.duration >= MIN_STREAK_DURATION &&
         session.completed; // Session reached end naturally
}
```

**Warning signs:**
- Users posting about "hacking" streaks with 1-second sessions
- Streak shows high numbers but total focus time is low

**Phase to address:**
Streak Implementation Phase (Phase 1 of v2.2)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using local timezone without DST handling | Simple date math | Broken streaks during DST transitions | Never |
| Skipping duplicate detection | Faster initial import | Data corruption, user trust loss | Never |
| Exporting without BOM | Smaller file | Breaks Excel, user frustration | Never |
| Using synchronous IndexedDB in bulk | Simpler code | UI freeze on large imports | Never |
| Hardcoding "today" as UTC midnight | Works in one timezone | Breaks for rest of world | Never |
| No import validation | Faster to implement | Garbage data in database | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| IndexedDB | Bulk add without transaction | Use single transaction for atomicity |
| File API | Not handling file encoding | Detect encoding, use TextDecoder |
| CSV parsing | Regex-based parsing fails on edge cases | Use a parser library or careful state machine |
| Date libraries | Importing entire library | Use tree-shaking (date-fns) |
| Blob downloads | Not handling blob URL cleanup | Revoke object URLs after download |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-calculating streak on every session | Slow UI after each session | Cache streak, invalidate only on new day | After 1000+ sessions |
| Full history load for calendar view | Slow history screen | Paginate or virtualize | After 500+ sessions |
| Parsing CSV entirely in memory | Memory spike, potential crash | Stream parse large files | Files > 1MB |
| Rendering calendar for all months | Slow initial render | Render visible months only | After 2+ years of data |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Importing CSV without sanitization | Malicious CSV could contain XSS | Sanitize note content before rendering |
| Importing without size limits | DoS via huge file | Limit import to reasonable session count (e.g., 10,000) |
| Exporting sensitive note content | Data exposure | Warn users that export includes all data |
| No CSRF on export (not applicable) | N/A - client-only | N/A |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No streak visibility until after session | Users forget about streak feature | Show current streak on timer screen |
| Export buried in settings menu | Users can't find export | Surface in history screen header |
| No import feedback | User unsure if import worked | Show success message with count |
| Import doesn't indicate merge behavior | Data loss or duplication confusion | Always show preview before importing |
| No way to clear streak | Accidental break feels permanent | Allow "streak recovery" or show grace period |
| Calendar doesn't show session details | Hard to verify streak accuracy | Click calendar day to see sessions |

---

## "Looks Done But Isn't" Checklist

- [ ] **Streak:** Works locally but breaks for international users — verify with UTC+12 and UTC-12 timezones
- [ ] **Streak:** Counts 1-second sessions — verify minimum duration enforcement
- [ ] **Export:** Works in Chrome but shows garbled text in Excel — verify BOM added
- [ ] **Import:** Fails silently on malformed CSV — verify error handling
- [ ] **Import:** Creates duplicates on re-import — verify duplicate detection
- [ ] **Import:** Freezes browser with large file — verify chunked processing
- [ ] **Calendar:** Doesn't load old months efficiently — verify virtualization
- [ ] **Streak:** Resets incorrectly at midnight — verify midnight boundary handling

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong timezone streaks | LOW | Recalculate from stored timestamps with correct timezone |
| Duplicate sessions from import | MEDIUM | Add deduplication logic, prompt user to clean duplicates |
| Corrupted CSV import | LOW | Show clear error message, suggest fixes |
| Streak calculation bug | LOW | Fix logic, recalculate, notify user of correction |
| Lost export file | N/A | User must have backup (educate about exports) |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Timezone streak bugs | Streak Implementation | Test with mock dates across timezones |
| Midnight edge cases | Streak Implementation | Complete session at 11:59 PM, verify streak |
| Invalid CSV export | CSV Export/Import | Re-import exported file, verify data integrity |
| Duplicate imports | CSV Export/Import | Import same file twice, verify no duplicates |
| Large import UI freeze | CSV Export/Import | Import 2000+ session file, verify responsiveness |
| Short session streak gaming | Streak Implementation | Complete 1-second session, verify it doesn't count |
| Missing BOM in CSV | CSV Export/Import | Open export in Excel, verify special characters |

---

## Sources

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) - JavaScript date handling caveats
- [RFC 4180](https://tools.ietf.org/html/rfc4180) - CSV format specification
- [OWASP: CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection) - CSV security considerations
- [date-fns Documentation](https://date-fns.org/) - Recommended date library
- [Dexie.js: Transactions](https://dexie.org/docs/Transaction/Transaction) - IndexedDB transaction patterns
- [Common Streak App Issues](https://github.com/topics/streak-tracker) - Community patterns

---

*Pitfalls research for: v2.2 Features - Streak Tracking & CSV Export/Import*
*Researched: 2026-02-23*
