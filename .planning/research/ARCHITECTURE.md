# Architecture Research: Redux Toolkit Integration

**Domain:** Pomodoro Timer — State Management Migration
**Researched:** 2026-02-21
**Confidence:** HIGH

---

# v2.2 Update: Streak Tracking + CSV Export/Import

**Added:** 2026-02-23
**Confidence:** HIGH

This section covers integration architecture for new v2.2 features: daily streak tracking and CSV data export/import.

---

## Executive Summary

This research document outlines the architecture for migrating an existing Pomodoro Timer application from React hooks (useReducer, useState) to Redux Toolkit. The existing architecture uses a well-structured hook-based approach with clear separation of concerns. The migration path prioritizes incremental adoption, maintaining existing IndexedDB persistence, and preserving the component API surface while centralizing state management.

**Key architectural decisions:**
1. **Slice-based organization** — Mirror existing hook boundaries (timer, session, history, ui)
2. **Persistence via Redux middleware** — Replace direct IndexedDB calls with middleware pattern
3. **Hook compatibility layer** — Existing components work with minimal changes via custom hooks
4. **Thunk for async operations** — Session saving, tag suggestions, and history fetching

---

## Current Architecture Overview

### Existing Hook Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   useTimer   │  │useSessionNotes│  │useSessionHistory│        │
│  │  (useReducer)│  │  (useState)  │  │  (useState)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────▼───────┐  ┌──────▼───────┐         │                   │
│  │useSessionManager│  │ persistence.ts │      │                   │
│  │  (composes)  │  │  (IndexedDB) │      │                   │
│  └──────────────┘  └──────────────┘  ┌──────▼───────┐          │
│                                      │ sessionStore.ts│          │
│                                      │  (IndexedDB) │          │
│                                      └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### State Domains

| Domain | Current Location | State Type | Persistence |
|--------|-----------------|------------|-------------|
| Timer | `useTimer.ts` | useReducer | IndexedDB (timerState) |
| Session Notes | `useSessionNotes.ts` | useState | In-memory only |
| Session Records | `useSessionManager.ts` | useRef + IndexedDB | IndexedDB (sessions) |
| History | `useSessionHistory.ts` | useState | IndexedDB (sessions) |
| UI | `App.tsx` | useState | None |
| Settings | `useTimer.ts` + `persistence.ts` | useState | IndexedDB (settings) |

---

## v2.2 Integration: Streak Tracking

### Overview

Streak tracking is **purely derived from existing session data** — no new IndexedDB schema, no new Redux slice required.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `streakUtils.ts` | Pure functions: calculateCurrentStreak, calculateLongestStreak, getStreakDays | Returns streak data, no side effects |
| `historySelectors.ts` (extend) | Memoized selectors: selectCurrentStreak, selectLongestStreak, selectStreakDays | Uses selectAllSessions, streakUtils |
| `StreakCounter.tsx` | Display current streak number | Uses selectors via useAppSelector |
| `StreakCalendar.tsx` | Visual calendar showing streak days | Uses selectors, renders grid of days |

### Data Flow

```
IndexedDB sessions
       ↓
selectAllSessions (existing)
       ↓
streakUtils.calculateCurrentStreak()
       ↓
selectCurrentStreak (new selector)
       ↓
StreakCounter component
```

### Implementation: streakUtils.ts

```typescript
import { SessionRecord } from '../types/session';

export interface StreakData {
  currentStreak: number;      // Consecutive days including today
  longestStreak: number;      // All-time best
  streakDays: Date[];         // Array of dates with sessions
  hasToday: boolean;          // Whether user has session today
}

export function calculateStreak(sessions: SessionRecord[]): StreakData {
  // Group sessions by date (YYYY-MM-DD)
  const sessionDates = new Set(
    sessions.map(s => s.startTimestamp.split('T')[0])
  );

  const sortedDates = Array.from(sessionDates).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const hasToday = sessionDates.has(today);

  // Calculate current streak (consecutive days from today/yesterday)
  let currentStreak = 0;
  const checkDate = new Date();

  // Start from today if exists, else yesterday
  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (sessionDates.has(checkDate.toISOString().split('T')[0])) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const ascendingDates = sortedDates.reverse();

  for (let i = 1; i < ascendingDates.length; i++) {
    const prev = new Date(ascendingDates[i - 1]);
    const curr = new Date(ascendingDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    streakDays: sortedDates.map(d => new Date(d)),
    hasToday,
  };
}
```

### Implementation: New Selectors

Add to `src/features/history/historySelectors.ts`:

```typescript
import { calculateStreak, StreakData } from '../../utils/streakUtils';

// Select streak data computed from all sessions
export const selectStreakData = createSelector(
  [selectAllSessions],
  (sessions): StreakData => {
    return calculateStreak(sessions);
  }
);

// Convenience selectors
export const selectCurrentStreak = createSelector(
  [selectStreakData],
  (streak) => streak.currentStreak
);

export const selectLongestStreak = createSelector(
  [selectStreakData],
  (streak) => streak.longestStreak
);
```

### No Changes Required

- **IndexedDB**: No schema changes — sessions already have `startTimestamp`
- **Redux store**: No new slice needed — streak is derived via selectors
- **sessionStore.ts**: No changes needed

---

## v2.2 Integration: CSV Export/Import

### Overview

- **Export**: Generate CSV from existing sessions in Redux/IndexedDB
- **Import**: Parse CSV, validate, bulk-add to IndexedDB, reload Redux

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `csvUtils.ts` | Pure functions: sessionsToCSV, csvToSessions, validateCSV | Parsing/serialization, validation |
| `sessionStore.ts` (extend) | Bulk import function | IndexedDB |
| `historySlice.ts` (extend) | Import status state + actions | Redux store |
| `ExportButton.tsx` | Trigger CSV download | Uses sessionStore + csvUtils |
| `ImportButton.tsx` | File input + import flow | Uses historySlice actions |
| `ImportModal.tsx` | Show import results/errors | Uses import state from Redux |

### Data Flow

**Export:**
```
User clicks Export
       ↓
getAllSessions() from sessionStore
       ↓
csvUtils.sessionsToCSV(sessions)
       ↓
Download file (blob URL)
```

**Import:**
```
User selects CSV file
       ↓
FileReader reads content
       ↓
csvUtils.csvToSessions(csvString) → validated sessions
       ↓
sessionStore.bulkImportSessions(sessions)
       ↓
historySlice.loadSessions (reload all from IndexedDB)
       ↓
UI shows success/error count
```

### Implementation: csvUtils.ts

```typescript
import { SessionRecord } from '../types/session';

const CSV_HEADERS = [
  'id',
  'startTimestamp',
  'endTimestamp',
  'plannedDurationSeconds',
  'actualDurationSeconds',
  'durationString',
  'mode',
  'startType',
  'completed',
  'noteText',
  'tags',
  'taskTitle',
  'createdAt',
].join(',');

export function sessionsToCSV(sessions: SessionRecord[]): string {
  const rows = sessions.map(session => [
    session.id,
    session.startTimestamp,
    session.endTimestamp,
    session.plannedDurationSeconds,
    session.actualDurationSeconds,
    session.durationString,
    session.mode,
    session.startType,
    session.completed,
    // Escape quotes in text fields
    `"${session.noteText.replace(/"/g, '""')}"`,
    `"${session.tags.join(';')}"`,
    `"${session.taskTitle.replace(/"/g, '""')}"`,
    session.createdAt,
  ].join(','));

  return [CSV_HEADERS, ...rows].join('\n');
}

export interface CSVParseResult {
  sessions: SessionRecord[];
  errors: string[];
}

export function csvToSessions(csv: string): CSVParseResult {
  const lines = csv.trim().split('\n');
  const errors: string[] = [];
  const sessions: SessionRecord[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    try {
      const session = parseCSVLine(lines[i]);
      if (validateSession(session)) {
        sessions.push(session);
      } else {
        errors.push(`Line ${i + 1}: Invalid session data`);
      }
    } catch (e) {
      errors.push(`Line ${i + 1}: ${e instanceof Error ? e.message : 'Parse error'}`);
    }
  }

  return { sessions, errors };
}

function parseCSVLine(line: string): Partial<SessionRecord> {
  // Simple CSV parser handling quoted fields
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  const [id, startTimestamp, endTimestamp, plannedDurationSeconds,
    actualDurationSeconds, durationString, mode, startType,
    completed, noteText, tags, taskTitle, createdAt] = values;

  return {
    id,
    startTimestamp,
    endTimestamp,
    plannedDurationSeconds: Number(plannedDurationSeconds),
    actualDurationSeconds: Number(actualDurationSeconds),
    durationString,
    mode: mode as SessionRecord['mode'],
    startType: startType as SessionRecord['startType'],
    completed: completed === 'true',
    noteText,
    tags: tags ? tags.split(';') : [],
    taskTitle,
    createdAt: Number(createdAt),
  };
}

function validateSession(s: Partial<SessionRecord>): s is SessionRecord {
  return !!(s.id && s.startTimestamp && s.endTimestamp && s.mode);
}
```

### Implementation: sessionStore.ts Extension

Add to `src/services/sessionStore.ts`:

```typescript
export async function bulkImportSessions(records: SessionRecord[]): Promise<number> {
  const db = await initDB();
  const tx = db.transaction('sessions', 'readwrite');
  let imported = 0;

  for (const record of records) {
    // Check for existing ID to avoid duplicates
    const existing = await tx.store.get(record.id);
    if (!existing) {
      await tx.store.put(record);
      imported++;
    }
  }

  await tx.done;
  return imported;
}
```

### Implementation: historySlice.ts Extension

Add import state to `HistoryState` and new actions:

```typescript
export interface HistoryState {
  // ... existing fields
  dateFilter: DateFilter
  searchQuery: string
  sessions: SessionRecord[]
  isLoading: boolean
  // NEW: Import state
  importStatus: 'idle' | 'importing' | 'success' | 'error'
  importResult: { imported: number; errors: string[] } | null
}

// New actions
setImportStatus(state, action: PayloadAction<HistoryState['importStatus']>) {
  state.importStatus = action.payload
},
setImportResult(state, action: PayloadAction<HistoryState['importResult']>) {
  state.importResult = action.payload
  state.importStatus = action.payload?.errors.length ? 'error' : 'success'
},
```

---

## Build Order for v2.2 Features

### Phase 1: Streak Infrastructure
1. **Create `src/utils/streakUtils.ts`** — Pure calculation functions (no dependencies)
2. **Add selectors to `src/features/history/historySelectors.ts`** — Memoized streak selectors
3. **Create `src/components/streak/StreakCounter.tsx`** — Simple display component
4. **Integrate into Stats view** — Add streak to existing stats panel

### Phase 2: Streak Calendar
5. **Create `src/components/streak/StreakCalendar.tsx`** — Visual calendar grid
6. **Add to History screen** — Calendar below session list

### Phase 3: CSV Export
7. **Create `src/utils/csvUtils.ts`** — CSV serialization/parsing
8. **Add Export button to History screen** — Downloads CSV file

### Phase 4: CSV Import
9. **Extend `src/services/sessionStore.ts`** — Add `bulkImportSessions()`
10. **Extend `src/features/history/historySlice.ts`** — Add import status state
11. **Create `src/components/import/ImportModal.tsx`** — File picker + results display
12. **Wire up import flow** — Button triggers modal, modal dispatches import

### Phase 5: Integration & Polish
13. **Connect import to reload** — After import, call `loadSessions` to refresh Redux
14. **Error handling** — Show validation errors in ImportModal
15. **Edge cases** — Handle empty CSV, duplicate IDs, malformed data

---

## Integration Points Summary

| Feature | New Files | Modify Existing | Redux Changes | IndexedDB Changes |
|---------|-----------|-----------------|---------------|-------------------|
| Streak Counter | `streakUtils.ts` | `historySelectors.ts` | None | None |
| Streak Calendar | `StreakCalendar.tsx`, `StreakCounter.tsx` | — | None | None |
| CSV Export | `csvUtils.ts` | — | None | None |
| CSV Import | `ImportModal.tsx` | `sessionStore.ts`, `historySlice.ts` | Add import state | Add bulk import |

---

## Key Design Decisions (v2.2)

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Streak as derived selector | Sessions already have timestamps — no duplication | Store streak in settings — adds sync complexity |
| CSV in-memory parse | Small datasets (<10k sessions) — no streaming needed | Use worker — overkill for app scale |
| Import via bulk ID check | Simple deduplication strategy | Upsert — more complex, same outcome |
| Import reloads all sessions | Ensures Redux/IndexedDB consistency | Optimistic update — risks state drift |

---

## Recommended Redux Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │TimerDisplay │ │ NotePanel   │ │HistoryList  │ │  Sidebar  │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘ │
└─────────┼───────────────┼───────────────┼──────────────┼───────┘
          │               │               │              │
          └───────────────┴───────┬───────┴──────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                    Custom Hooks Layer                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  useTimer() ┊ useSessionNotes() ┊ useSessionHistory()   │   │
│  │  (connects to Redux, maintains existing API)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                      Redux Store                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ timerSlice  │ │ sessionSlice│ │ historySlice│ │  uiSlice  │ │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├───────────┤ │
│  │ mode        │ │ noteText    │ │ sessions    │ │ viewMode  │ │
│  │ timeRemaining│ │ tags        │ │ filters    │ │ isDrawerOpen│ │
│  │ isRunning   │ │ saveStatus  │ │ searchQuery │ │ showSummary│ │
│  │ duration    │ │ lastSaved   │ │ isLoading   │ │ selected   │ │
│  │ sessionCount│ │             │ │ importStatus│ │            │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                   Middleware Layer                               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ persistenceMiddleware│ │ sessionMiddleware│ │  thunkMiddleware │   │
│  │ (IndexedDB sync)│ │ (auto-save)     │ │ (async ops)     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### State Shape

```typescript
// Root state structure
interface RootState {
  timer: TimerSliceState
  session: SessionSliceState
  history: HistorySliceState
  ui: UISliceState
}

// Timer slice — replaces useTimer reducer
interface TimerSliceState {
  mode: TimerMode                    // 'focus' | 'shortBreak' | 'longBreak'
  duration: number                   // current mode duration in seconds
  timeRemaining: number              // countdown value
  isRunning: boolean
  sessionCount: number               // for long break logic
  startTime: number | null           // timestamp when started
  pausedTimeRemaining: number | null // stored when paused
  settings: {                        // merged from persistence.ts
    autoStart: boolean
    focusDuration: number
    shortBreakDuration: number
    longBreakDuration: number
  }
}

// Session slice — replaces useSessionNotes + useSessionManager
interface SessionSliceState {
  // Current session notes (ephemeral)
  currentSession: {
    noteText: string
    tags: string[]
    saveStatus: 'idle' | 'saving' | 'saved'
    lastSaved: number | null
  }
  // Active session tracking
  activeSession: {
    id: string | null
    startTime: number | null
    mode: TimerMode
    isCheckpointsEnabled: boolean
  } | null
  // Tag management
  tags: {
    allTags: TagData[]
    suggestions: string[]
    isLoading: boolean
  }
}

// History slice — replaces useSessionHistory
interface HistorySliceState {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  filters: {
    dateFilter: DateFilter
    searchQuery: string
  }
  isLoading: boolean
  error: string | null
  // v2.2: Import state
  importStatus: 'idle' | 'importing' | 'success' | 'error'
  importResult: { imported: number; errors: string[] } | null
}

// UI slice — replaces App.tsx component state
interface UISliceState {
  viewMode: 'timer' | 'history' | 'stats' | 'settings'
  modals: {
    showSummary: boolean
    completedSession: CompletedSession | null
  }
  drawer: {
    isOpen: boolean
    selectedSessionId: string | null
  }
}
```

---

## Project Structure

### Recommended Folder Organization

```
src/
├── store/
│   ├── index.ts                 # Store configuration, middleware setup
│   ├── slices/
│   │   ├── timerSlice.ts        # Timer state + actions
│   │   ├── sessionSlice.ts      # Session notes + active session
│   │   ├── historySlice.ts      # Session history + filters
│   │   └── uiSlice.ts           # UI state (view mode, modals)
│   ├── middleware/
│   │   ├── persistenceMiddleware.ts  # IndexedDB sync
│   │   └── sessionMiddleware.ts      # Auto-save checkpoints
│   └── thunks/
│       ├── sessionThunks.ts     # Async session operations
│       └── historyThunks.ts     # History fetching
├── hooks/
│   ├── useTimer.ts              # Redux-connected (maintains API)
│   ├── useSessionNotes.ts       # Redux-connected (maintains API)
│   ├── useSessionManager.ts     # Redux-connected (maintains API)
│   ├── useSessionHistory.ts     # Redux-connected (maintains API)
│   └── useAppDispatch.ts        # Typed dispatch hook
├── selectors/
│   ├── timerSelectors.ts        # Memoized timer selectors
│   ├── sessionSelectors.ts      # Memoized session selectors
│   └── historySelectors.ts      # Memoized history selectors (v2.2: streak)
├── components/
│   ├── streak/                  # v2.2: Streak components
│   │   ├── StreakCounter.tsx
│   │   └── StreakCalendar.tsx
│   └── import/                  # v2.2: Import components
│       └── ImportModal.tsx
└── utils/
    ├── streakUtils.ts           # v2.2: Streak calculation
    └── csvUtils.ts              # v2.2: CSV export/import
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Putting Non-Serializable State in Redux

**What people do:** Store DOM refs, promises, or complex objects in Redux state.

**Why it's wrong:** Redux state must be serializable for DevTools, persistence, and time-travel debugging.

**Do this instead:** Keep refs and ephemeral state in components/hooks. Only put app state in Redux.

```typescript
// BAD
const badSlice = createSlice({
  initialState: { intervalRef: null as number | null },  // Don't store refs
  reducers: { ... }
})

// GOOD
// Keep intervalRef in useTimer hook, not in Redux
```

### Anti-Pattern 2: Direct IndexedDB Calls in Components

**What people do:** Components call `saveSession()` directly.

**Why it's wrong:** Side effects should be in middleware or thunks, not components.

**Do this instead:** Dispatch actions, let middleware handle persistence.

```typescript
// BAD
const handleSave = async () => {
  await saveSession(record)  // Don't do this in components
}

// GOOD
dispatch(saveSessionThunk(record))  // Thunk handles async
```

### Anti-Pattern 3: Storing Derived Data in Redux

**What people do:** Store `filteredSessions` or streak data as state instead of computing it.

**Why it's wrong:** Creates synchronization bugs. Derived data should be computed via selectors.

**Do this instead:** Use createSelector for memoized derived data.

```typescript
// BAD
// Storing filteredSessions in state

// GOOD
const selectFilteredSessions = createSelector(
  [selectSessions, selectFilters],
  (sessions, filters) => {
    // Compute filtered sessions
    return sessions.filter(...)
  }
)
```

### Anti-Pattern 4: Monolithic Slices

**What people do:** Put all state in one giant `appSlice`.

**Why it's wrong:** Hard to maintain, test, and reason about. Loses modularity.

**Do this instead:** Follow existing hook boundaries — one slice per domain.

---

## Scalability Considerations

| Scale | Considerations |
|-------|----------------|
| Current (100s of sessions) | Current architecture fine. Selectors handle filtering efficiently. |
| 1,000+ sessions | Implement pagination in historyThunks. Use virtualized lists (react-window). |
| 10,000+ sessions | Move filtering to IndexedDB queries instead of in-memory. Consider IndexedDB cursors. |

### Performance Optimizations

1. **Selector Memoization**: Use `createSelector` for all filtered/computed data (including streak)
2. **Component Memoization**: Wrap display components with `React.memo`
3. **Action Batching**: Redux Toolkit automatically batches actions
4. **Lazy Loading**: History data fetched only when viewMode === 'history'

---

## Sources

- Redux Toolkit Documentation: https://redux-toolkit.js.org/
- Redux Style Guide: https://redux.js.org/style-guide/
- Existing codebase:
  - `src/features/history/historySlice.ts`
  - `src/features/history/historySelectors.ts`
  - `src/services/sessionStore.ts`
  - `src/types/session.ts`
  - `src/utils/dateUtils.ts`

---

*Architecture research for: Redux Toolkit integration + v2.2 features (streak, CSV export/import)*
*Researched: 2026-02-21 (base), 2026-02-23 (v2.2 update)*
