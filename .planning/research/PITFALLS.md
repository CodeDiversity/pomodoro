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

# Pitfalls Research: v2.3 Rich Text Session Notes

**Domain:** Adding rich text (bold, bullets, links) to existing session notes
**Researched:** 2026-02-24
**Confidence:** MEDIUM (based on GitHub issues from popular rich text libraries)

---

## Critical Pitfalls for Rich Text

### Pitfall 1: HTML Storage Without Sanitization

**What goes wrong:**
Stored HTML in notes becomes a vector for XSS attacks. Users paste malicious scripts that execute when other parts of the app render the note content (history view, export, etc.).

**Why it happens:**
Rich text editors produce HTML output. Developers often store this directly without sanitization, trusting the editor or assuming users are "just typing notes."

**How to avoid:**
Use a sanitization library (dompurify) on output, not just input. Sanitize when rendering in read mode, not just when saving.

```typescript
import DOMPurify from 'dompurify';

// When displaying notes (read mode)
const cleanHTML = DOMPurify.sanitize(note.htmlContent);
```

**Warning signs:**
- No sanitization step in display components
- Direct innerHTML usage without cleaning
- User-reported "code appearing in notes"

**Phase to address:**
Phase 1 (Editor Implementation) — Sanitization must be part of the initial implementation, not added later.

---

### Pitfall 2: Inconsistent Rendering Between Editor and Display

**What goes wrong:**
Text looks formatted in the editor but loses formatting in session modal or history drawer. Bullet points become plain text with dashes. Bold text shows `<strong>` tags literally.

**Why it happens:**
Using different components for editing vs. viewing. The editor uses Quill/Tiptap but display uses simple `div` with `dangerouslySetInnerHTML`.

**How to avoid:**
Create a shared `NoteContent` component that uses the same rendering logic everywhere:
- Session modal: uses `NoteContent`
- History drawer: uses `NoteContent`
- Export: sanitizes the same way

**Warning signs:**
- Multiple places handling note display differently
- "It works in the editor but not in..." complaints

**Phase to address:**
Phase 2 (Display Integration) — This requires planning the display components before implementing individual features.

---

### Pitfall 3: Breaking Existing Plain Text Notes

**What goes wrong:**
After adding rich text, existing notes either:
- Show raw HTML tags to users
- Lose all formatting when edited
- Crash the editor on load

**Why it happens:**
Existing notes are plain text (stored as-is). Rich text editor tries to parse plain text as HTML/Quill Delta.

**How to avoid:**
- Version the schema to detect note format
- Handle both plain text and HTML/delta in the editor initialization
- Default to plain text mode for legacy notes until first edit

```typescript
// Handle legacy notes
const initializeEditorContent = (note: string) => {
  if (note.includes('<') && note.includes('>')) {
    return note; // Already has HTML
  }
  return note; // Plain text - Quill handles this fine
};
```

**Warning signs:**
- No migration strategy for existing notes
- Testing only with new rich text notes

**Phase to address:**
Phase 1 (Editor Implementation) — Must verify editor handles plain text gracefully before any other work.

---

### Pitfall 4: React 18/19 Compatibility with Editor Libraries

**What goes wrong:**
Editor throws "findDOMNode is not a function" errors. Deprecated warnings in console. Editor fails to initialize.

**Why it happens:**
Many rich text libraries use `ReactDOM.findDOMNode` which is deprecated in React 18+ and removed in React 19.

**How to avoid:**
- Verify library supports React 18+ before choosing
- Check for React 19 compatibility issues in library issues
- For Quill: use `@nickcolley/react-quill` fork or wait for official Quill v2

**Warning signs:**
- Peer dependency warnings during install
- Console warnings about findDOMNode
- "TypeError: undefined is not an object" on editor mount

**Phase to address:**
Phase 1 (Editor Implementation) — Verify compatibility early in the phase.

---

### Pitfall 5: Link Rendering Inconsistency

**What goes wrong:**
Links inserted in editor work there but show as plain text `[url](https://...)` or `<a>` tags without clickable behavior in history/details views.

**Why it happens:**
Link rendering requires special handling — either `target="_blank"`, security rel attributes, or click handler interception.

**How to avoid:**
- Use a consistent link component for all displays
- Add `rel="noopener noreferrer"` for security
- Test link rendering in every view (modal, drawer, export)

```typescript
const LinkRenderer = ({ html }: { html: string }) => {
  // Ensure all links open in new tab with security attributes
  const secureHTML = html.replace(
    /<a href="/g,
    '<a target="_blank" rel="noopener noreferrer" href="'
  );
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(secureHTML) }} />;
};
```

**Warning signs:**
- Testing only in editor, not in read-only views

**Phase to address:**
Phase 2 (Display Integration) — Links must be tested in all display contexts.

---

### Pitfall 6: Bullet List Numbering Resets Incorrectly

**What goes wrong:**
In nested bullet lists, numbering resets unexpectedly. Sub-bullets continue parent numbering. Lists don't start new count after ending nested section.

**Why it happens:**
Rich text editor list implementation bugs (known issue in Quill). CSS counter reset not properly scoped.

**How to avoid:**
- Test nested lists thoroughly
- Consider using CSS counters with proper reset
- Use editor library that handles this correctly

**Warning signs:**
- Lists render differently than in editor
- Numbered lists show wrong numbers

**Phase to address:**
Phase 2 (Display Integration) — Must test all list rendering paths.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use plain `dangerouslySetInnerHTML` without sanitization | Faster initial implementation | XSS vulnerability, security audit failures | Never — always sanitize |
| Hardcode editor toolbar options | Simpler initial UI | Hard to add features later, must refactor | Only for MVP, plan for expansion |
| Skip mobile editor testing | Faster desktop development | Broken experience for mobile users, bad reviews | Never — test on mobile early |
| Store raw HTML directly from editor | No transformation needed | Tight coupling to editor, migration pain if changing editors | Acceptable with versioned schema |
| Skip character limit validation on HTML | Avoids HTML-length edge cases | Users can exceed storage limits, performance issues | Never — validate on save |
| Use editor in disabled mode for read-only | Reuse component | Poor UX, accessibility issues | Never — use separate display component |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| IndexedDB storage | Storing editor Delta format directly without understanding it | Store as HTML string (easier to render anywhere) or store both Delta + sanitized HTML |
| Redux state | Storing rich text in Redux causing excessive re-renders | Keep rich text in component state, only sync to Redux on save |
| CSV Export | Exporting raw HTML in CSV makes it unreadable | Strip HTML to plain text for CSV, keep HTML for JSON backup |
| Session Modal | Re-creating editor in read-only mode | Use read-only display component, not editor in disabled mode |
| Character limit | Checking note.length which counts HTML tags | Calculate visible text length, not HTML length |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| onChange triggers on every keystroke | Typing lag, excessive re-renders | Use debounce on onChange handler (300ms) | At notes >500 words |
| Large note rendering | Slow history list scroll | Virtualize list or limit rendered note preview | At 1000+ sessions |
| Editor initialization delay | App feels slow on session start | Lazy load editor component | Always noticeable |
| Sanitizing on every render | Display feels sluggish | Cache sanitized output, only re-sanitize on content change | At scale with many notes |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No HTML sanitization | XSS via pasted scripts in notes | Use DOMPurify on all display paths |
| Links without rel="noopener" | Tabnabbing vulnerability | Always add rel="noopener noreferrer" |
| User-entered URLs not validated | Phishing links in notes | Validate URL format, warn on suspicious patterns |
| Export includes unsanitized HTML | Data exfiltration if CSV opened in browser | Sanitize before export |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback on formatting | Users unsure if bold/bullet applied | Show active state on toolbar buttons |
| Links not distinguishable in display | Users can't tell what's clickable | Style links distinctly (blue, underline) |
| Mobile toolbar unusable | Can't format notes on phone | Use bubble menu or simplified toolbar for mobile |
| Character count confusing | HTML length >> visible text | Show visual character count, not HTML length |
| No undo/redo in editor | Mistakes require re-typing | Enable built-in undo/redo |
| Pasted content loses formatting | Copy from Word doesn't work | Handle paste events, use editor's paste handler |

---

## "Looks Done But Isn't" Checklist

- [ ] **Toolbar buttons:** Often implemented but not wired to actual formatting — verify bold actually makes text bold
- [ ] **Links in history:** Often work in editor but show as plain text in history drawer — test all display paths
- [ ] **Mobile formatting:** Often works on desktop, broken on iOS — test on actual device
- [ ] **Existing notes:** Often break when opened in new rich text editor — test with legacy plain text
- [ ] **Character limit:** Often only checks raw HTML length, not visible text — 2000 chars of `<b>x</b>` is way more than 2000 visible chars
- [ ] **Copy/paste:** Often strips formatting unexpectedly — test pasting from Word, browser, other apps
- [ ] **Sanitization:** Often missing on display paths — verify all paths sanitize HTML

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| XSS vulnerability discovered | HIGH | Add sanitization everywhere, audit all display paths, may need to notify users |
| Legacy notes broken | MEDIUM | Add migration phase, convert plain text to minimal HTML wrapper |
| Mobile broken | MEDIUM | Choose mobile-compatible library, may need to redesign toolbar |
| Performance issues | LOW-MEDIUM | Add debouncing, memoization, virtualization — incremental fixes |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| HTML Storage Without Sanitization | Phase 1 (Editor) | Unit test sanitization, security audit before ship |
| Inconsistent Rendering | Phase 2 (Display) | Create shared component, verify in all views |
| Breaking Existing Notes | Phase 1 (Editor) | Test with plain text, add migration logic |
| React Compatibility | Phase 1 (Editor) | Verify library compatibility, test mount/unmount |
| Link Rendering | Phase 2 (Display) | Test links in modal, drawer, export |
| Performance (onChange) | Phase 1 (Editor) | Add debounce, profile with large content |
| Mobile UX | Phase 2 (Display) | Test on iOS Safari, verify toolbar usable |
| Bullet List Bugs | Phase 2 (Display) | Test nested lists in all views |

---

## Sources

- [React-Quill GitHub Issues](https://github.com/zenoamaro/react-quill/issues) - SSR problems, onChange triggers, list numbering bugs
- [Tiptap GitHub Issues](https://github.com/ueberdosis/tiptap/issues) - Mobile Safari issues, TypeScript types, React integration
- General rich text security best practices: Always sanitize on output, not just input
- Project constraints: 2000 char limit on notes (must validate visible text, not HTML)

---

*Pitfalls research for: v2.3 Rich Text Session Notes*
*Researched: 2026-02-24*
