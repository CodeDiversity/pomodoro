# Phase 3: History & Stats - Research

**Researched:** 2026-02-19
**Domain:** React Web Application - Session History & Statistics UI
**Confidence:** HIGH

## Summary

Phase 3 implements session history viewing and productivity statistics. The existing codebase already has IndexedDB persistence via `idb` library with a sessions store indexed by date. The `sessionStore.ts` provides basic CRUD operations. This phase adds the UI layer: history list with filtering/search, slide-out drawer for details, and stat cards for productivity metrics.

**Primary recommendation:** Build all components using existing React + styled-components stack. Use IndexedDB cursors for pagination. Use native Intl API for date formatting. No additional libraries required.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- History list layout: compact list rows, medium info density (date, duration, note preview)
- Date format: Numeric (02/19/2026 2:30 PM)
- Tags as inline pills in each row
- Sort: Newest first (default)
- Empty state: Friendly message with CTA
- Pagination: Load more button (not infinite scroll)
- Duration format: Full words ("25 minutes", "1 hour 15 minutes")
- Details view: Slide-out drawer from right (not modal)
- Editing: Auto-save as user types (no save button)
- Deletion: Confirm dialog before deleting
- Date filters: Clickable chips (not dropdown)
- Standard 4 options: Today, 7 days, 30 days, All
- Text search: Instant search (searches notes and tags)
- Filters/search combine with AND logic
- Stats: Display as stat cards (not charts)
- 4 metrics: Total focus time today, Total focus time last 7 days, Sessions today, Longest session in range
- Layout: 2x2 grid of stat cards

### Claude's Discretion
- Exact styling of filter chips (colors, size)
- Loading skeleton design for history list
- Empty state illustration (if any)
- Stat card visual styling (icons, emphasis)

### Deferred Ideas (OUT OF SCOPE)
- Charts/graphs for stats — Phase 4 or future phase
- Export session data — future phase
- Sharing/stats visibility — future phase

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HIST-01 | History displays list of Focus session records, newest first | IndexedDB has 'by-date' index on sessions, sessionStore.getAllSessions returns sorted by date |
| HIST-02 | Each item shows: date/time, actual duration, note preview (truncated), tags | UI component requirements - styled-components can render compact rows |
| HIST-03 | Click item opens details drawer/modal | Slide-out drawer using CSS transforms via styled-components |
| HIST-04 | Details show: full note, start/end timestamps, duration | Already stored in SessionRecord type |
| HIST-05 | Details allow editing note and tags | Auto-save pattern - useSessionNotes hook already exists |
| HIST-06 | Details allow deleting record | sessionStore.deleteSession already exists |
| HIST-07 | Filter by date range: Today, Last 7 days, Last 30 days, All | Date filtering logic in query layer |
| HIST-08 | Search input filters by text in notes and tags | Client-side filtering with AND logic |
| STAT-01 | Display total focus time today | Calculate from filtered sessions |
| STAT-02 | Display total focus time last 7 days | Calculate from filtered sessions |
| STAT-03 | Display number of focus sessions today | Calculate from filtered sessions |
| STAT-04 | Display longest focus session in selected range | Calculate from filtered sessions |

</phase_requirements>

## Standard Stack

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI Framework | Current stable, industry standard |
| TypeScript | 5.6.2 | Type Safety | Catches errors at compile time |
| Vite | 6.0.1 | Build Tool | Fast dev server, optimized builds |
| styled-components | 6.3.10 | CSS-in-JS Styling | Scoped styles, theming support, dynamic props |

### Supporting (Already in Use)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| idb | 8.0.0 | IndexedDB Wrapper | Promise-based IndexedDB API, already in use |

### Additional Libraries Needed
**None required.** All functionality can be built with existing stack:
- Date formatting: Use native `Intl.DateTimeFormat` API
- Duration formatting: Custom utility function
- Pagination: IndexedDB cursors
- Drawer animation: CSS transforms via styled-components

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── history/
│   │   ├── HistoryList.tsx       # Main list container
│   │   ├── HistoryItem.tsx       # Single row component
│   │   ├── HistoryFilters.tsx    # Date filter chips + search
│   │   ├── HistoryDrawer.tsx     # Slide-out details drawer
│   │   └── HistoryEmpty.tsx      # Empty state component
│   └── stats/
│       ├── StatsGrid.tsx         # 2x2 grid container
│       └── StatCard.tsx          # Individual stat card
├── hooks/
│   ├── useSessionHistory.ts      # Fetch/filter sessions hook
│   └── useFilteredStats.ts       # Calculate stats from filtered data
├── utils/
│   ├── dateUtils.ts              # Date formatting utilities
│   └── durationUtils.ts          # Duration formatting
└── services/
    └── sessionStore.ts           # Already exists - add paginated queries
```

### Pattern 1: IndexedDB Pagination with Cursors
**What:** Load sessions in batches using IDBCursor
**When to use:** Implementing "load more" pagination
**Example:**
```typescript
// Source: idb library documentation
export async function getSessionsPaginated(
  limit: number,
  cursorKey?: string
): Promise<{ sessions: SessionRecord[]; nextCursor: string | null }> {
  const db = await initDB()
  const tx = db.transaction('sessions')
  const index = tx.store.index('by-date')

  let cursor: IDBPCursor | null = null
  const sessions: SessionRecord[] = []

  if (cursorKey) {
    // Start after the cursor key (reverse order for newest first)
    cursor = await index.openCursor(null, 'prev')
    while (cursor) {
      if (cursor.key === cursorKey) {
        cursor = await cursor.continue()
        break
      }
      cursor = await cursor.continue()
    }
  } else {
    cursor = await index.openCursor(null, 'prev') // Reverse for newest first
  }

  let count = 0
  while (cursor && count < limit) {
    sessions.push(cursor.value)
    count++
    cursor = await cursor.continue()
  }

  return {
    sessions,
    nextCursor: cursor ? String(cursor.key) : null
  }
}
```

### Pattern 2: Slide-Out Drawer with styled-components
**What:** Animated drawer from right edge
**When to use:** Session details view
**Example:**
```typescript
import styled from 'styled-components'
import { keyframes } from 'styled-components'

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
`

const DrawerPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100%;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  animation: ${props => props.$isOpen ? slideIn : 'none'} 0.3s ease-out;
  z-index: 101;
  overflow-y: auto;
`
```

### Pattern 3: Filter Chips Component
**What:** Clickable date range chips with active state
**When to use:** History filtering
**Example:**
```typescript
const FilterChip = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${props => props.$active ? '#007AFF' : '#E0E0E0'};
  background: ${props => props.$active ? '#007AFF' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007AFF;
  }
`
```

### Pattern 4: Auto-Save with Debounce
**What:** Save changes automatically as user types
**When to use:** Editing note and tags in drawer
**Example:**
```typescript
import { useCallback, useRef, useEffect } from 'react'

function useDebouncedSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 500
) {
  const timeoutRef = useRef<number>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = window.setTimeout(() => {
      onSave(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSave, delay])
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB wrapper | Build custom IndexedDB layer | idb library (already in use) | idb provides promise-based API, type safety, handles edge cases |
| Date formatting | Build custom date parser | Intl.DateTimeFormat (native) | Full i18n support, handles all locales, no dependencies |
| CSS framework | Install Tailwind or Bootstrap | styled-components (already in use) | Scoped styles, no runtime overhead issue for this app size |

---

## Common Pitfalls

### Pitfall 1: IndexedDB Pagination Performance
**What goes wrong:** Loading all sessions then slicing in memory defeats pagination purpose
**Why it happens:** Calling getAllFromIndex returns entire dataset
**How to avoid:** Use cursors to load batches from database directly
**Warning signs:** App slows down with hundreds of sessions

### Pitfall 2: Search Performance
**What goes wrong:** Searching on every keystroke causes lag
**Why it happens:** No debouncing on search input
**How to avoid:** Debounce search input by 200-300ms
**Warning signs:** UI freezes while typing in search box

### Pitfall 3: Date Filter Edge Cases
**What goes wrong:** Sessions at midnight boundary excluded incorrectly
**Why it happens:** Not using proper timezone handling
**How to avoid:** Use UTC for date comparisons or use date-fns startOfDay/endOfDay
**Warning signs:** Today's sessions missing or showing at midnight

### Pitfall 4: Auto-Save Race Conditions
**What goes wrong:** Multiple rapid saves conflict or overwrite each other
**Why it happens:** No debounce or save queue
**How to avoid:** Single debounced save with latest value
**Warning signs:** Tags disappear, notes revert to old values

### Pitfall 5: Filter State Persistence
**What goes wrong:** Filter/search state lost when navigating back from drawer
**Why it happens:** State not lifted to parent or stored in context
**How to avoid:** Keep filter state in parent component, pass to list and drawer
**Warning signs:** Filters reset after viewing session details

---

## Code Examples

### Date Formatting (Full Format - Numeric)
```typescript
// Source: Native Intl API
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d)
}

// Example output: "02/19/2026 2:30 PM"
```

### Duration Formatting (Full Words)
```typescript
// Source: Custom utility
export function formatDurationFull(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
}

// Example output: "25 minutes", "1 hour 15 minutes", "2 hours"
```

### Filter Date Range Calculation
```typescript
// Source: Custom utility
export type DateFilter = 'today' | '7days' | '30days' | 'all'

export function getDateRange(filter: DateFilter): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (filter) {
    case 'today':
      return { start: today, end: now }
    case '7days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 7)
      return { start, end: now }
    }
    case '30days': {
      const start = new Date(today)
      start.setDate(start.getDate() - 30)
      return { start, end: now }
    }
    case 'all':
    default:
      return null
  }
}
```

### Search Filter Logic
```typescript
// Source: Custom utility
export function filterSessions(
  sessions: SessionRecord[],
  dateFilter: DateFilter,
  searchQuery: string
): SessionRecord[] {
  const range = getDateRange(dateFilter)

  return sessions.filter(session => {
    // Date filter
    if (range) {
      const sessionDate = new Date(session.createdAt)
      if (sessionDate < range.start || sessionDate > range.end) {
        return false
      }
    }

    // Search filter (AND logic)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const noteMatches = session.noteText.toLowerCase().includes(query)
      const tagMatches = session.tags.some(tag => tag.toLowerCase().includes(query))
      return noteMatches || tagMatches
    }

    return true
  })
}
```

### Stats Calculation
```typescript
// Source: Custom utility
export interface Stats {
  totalFocusTimeToday: number      // seconds
  totalFocusTimeLast7Days: number // seconds
  sessionsToday: number
  longestSession: number           // seconds
}

export function calculateStats(sessions: SessionRecord[]): Stats {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(todayStart)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const todaySessions = sessions.filter(s => new Date(s.createdAt) >= todayStart)
  const weekSessions = sessions.filter(s => new Date(s.createdAt) >= weekAgo)

  return {
    totalFocusTimeToday: todaySessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0),
    totalFocusTimeLast7Days: weekSessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0),
    sessionsToday: todaySessions.length,
    longestSession: Math.max(0, ...sessions.map(s => s.actualDurationSeconds))
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Modal overlay for details | Slide-out drawer | User decision | Better UX for viewing while maintaining context |
| Infinite scroll pagination | Load more button | User decision | More explicit control, easier to implement |
| Dropdown for date filters | Clickable chips | User decision | Faster selection, mobile-friendly |
| Charts for stats | Stat cards | Deferred to Phase 4 | Simplifies Phase 3, reduces scope |

**Deprecated/outdated:**
- None relevant to this phase

---

## Open Questions

1. **Tag Suggestions in History**
   - What we know: TagInput currently has suggestion functionality
   - What's unclear: Should history drawer also show tag suggestions when editing?
   - Recommendation: Reuse existing getTagSuggestions from sessionStore

2. **Session Count for "Load More"**
   - What we know: Need to track total count for "has more" state
   - What's unclear: Should we cache count or query on each load?
   - Recommendation: Query count separately, cache in component state

---

## Sources

### Primary (HIGH confidence)
- idb library (v8.0.0) - IndexedDB wrapper, already in project
- styled-components (v6.3.10) - CSS-in-JS, already in project
- React (v18.3.1) - UI framework, already in project

### Secondary (MEDIUM confidence)
- Native Intl.DateTimeFormat - Standard browser API for date formatting
- CSS transforms for drawer animation - Standard CSS, widely supported

### Tertiary (LOW confidence)
- N/A - All required patterns can be built with existing stack

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All required libraries already in use
- Architecture: HIGH - Clear structure based on existing patterns
- Pitfalls: HIGH - Identified common patterns for IndexedDB and React

**Research date:** 2026-02-19
**Valid until:** 30 days for stable patterns, 7 days for fast-moving areas
