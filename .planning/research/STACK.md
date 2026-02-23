# Stack Research: v2.2 Features (Streak Tracking + CSV Export/Import)

**Domain:** React 18 + TypeScript Pomodoro Timer - Streak Counter & Data Export
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

For adding daily streak tracking and CSV export/import to an existing Pomodoro timer app:

1. **No new dependencies needed for streak calculation** — existing `createdAt` timestamps and native Date APIs are sufficient
2. **Custom calendar component recommended** — lightweight, matches existing styled-components pattern
3. **papaparse for CSV** — industry standard, handles edge cases, TypeScript support built-in
4. **Existing IndexedDB and Redux integration points identified**

---

## Recommended Stack Additions

### CSV Parsing/Generation

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| papaparse | ^5.4.1 | CSV parsing and generation | Industry standard (12M+ weekly downloads). Handles edge cases (quoted fields, newlines, special chars). TypeScript types included. No dependencies. |

**Installation:**
```bash
npm install papaparse@^5.4.1
```

### Calendar/Streak UI

| Approach | Purpose | Why Recommended |
|----------|---------|-----------------|
| Custom styled-components | Calendar grid with streak visualization | Lightweight (~100 LOC). Matches existing theme tokens. Full control over styling. No bloat from calendar libraries. |
| Native Date APIs | Date manipulation | Already used in `dateUtils.ts` and `statsUtils.ts`. Sufficient for streak logic. |

### What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-big-calendar | Overkill for streak display | Custom grid (simpler, lighter) |
| react-datepicker | Date picker, not calendar display | Custom component |
| date-fns | Adds 70KB+ bundle for simple needs | Native Date APIs already in codebase |
| moment.js | Deprecated, large bundle | Native Date APIs |
| csv-parse / csv-stringify | Lower level than papaparse | papaparse (easier API) |

---

## Integration with Existing Architecture

### Data Flow for Streak Tracking

```
SessionRecord (IndexedDB)
    ↓
Session saved with createdAt timestamp
    ↓
HistorySlice selectors → getAllSessions()
    ↓
Streak calculation (in statsUtils.ts or new streakUtils.ts)
    ↓
Redux state → StreakDisplay component
    ↓
styled-components calendar grid
```

### Existing Integration Points

| Existing File | What It Provides |
|---------------|------------------|
| `src/types/session.ts` | `SessionRecord` interface with `createdAt: number` |
| `src/utils/dateUtils.ts` | `getDateRange()`, `formatDateShort()` |
| `src/utils/statsUtils.ts` | `getTodayStart()`, `getWeekAgo()`, date calculations |
| `src/services/sessionStore.ts` | `getAllSessions()` to fetch history |
| `src/features/history/historySlice.ts` | Redux slice with sessions |
| `src/features/history/historySelectors.ts` | Memoized selectors |
| `src/services/db.ts` | IndexedDB schema (sessions store with `by-date` index) |

### Streak Calculation Logic (Pseudo-code)

```typescript
// src/utils/streakUtils.ts

interface StreakData {
  currentStreak: number      // Consecutive days including today
  longestStreak: number       // All-time best
  lastActiveDate: string      // ISO date string "YYYY-MM-DD"
  activeDates: Set<string>   // All dates with sessions
}

/**
 * Calculate streak data from session records
 * Uses createdAt timestamp (already in SessionRecord)
 */
export function calculateStreak(sessions: SessionRecord[]): StreakData {
  // Extract unique dates (YYYY-MM-DD format) from sessions
  const activeDates = new Set<string>()

  sessions.forEach(session => {
    const date = new Date(session.createdAt).toISOString().split('T')[0]
    activeDates.add(date)
  })

  // Sort dates for streak calculation
  const sortedDates = Array.from(activeDates).sort()

  // Calculate current streak (consecutive days ending today/yesterday)
  let currentStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // If no activity today or yesterday, streak is broken
  if (!activeDates.has(today) && !activeDates.has(yesterday)) {
    currentStreak = 0
  } else {
    // Count backwards from today/yesterday
    let checkDate = activeDates.has(today) ? today : yesterday
    while (activeDates.has(checkDate)) {
      currentStreak++
      const prev = new Date(checkDate)
      prev.setDate(prev.getDate() - 1)
      checkDate = prev.toISOString().split('T')[0]
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  sortedDates.forEach(dateStr => {
    const date = new Date(dateStr)
    if (prevDate) {
      const diffDays = Math.floor((date.getTime() - prevDate.getTime()) / 86400000)
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    } else {
      tempStreak = 1
    }
    prevDate = date
  })
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: sortedDates[sortedDates.length - 1] || '',
    activeDates,
  }
}
```

### CSV Export/Import Integration

#### Export: Sessions to CSV

```typescript
// src/utils/csvExport.ts
import Papa from 'papaparse'
import { SessionRecord } from '../types/session'

export function sessionsToCSV(sessions: SessionRecord[]): string {
  const data = sessions.map(session => ({
    id: session.id,
    startTimestamp: session.startTimestamp,
    endTimestamp: session.endTimestamp,
    plannedDurationSeconds: session.plannedDurationSeconds,
    actualDurationSeconds: session.actualDurationSeconds,
    durationString: session.durationString,
    mode: session.mode,
    startType: session.startType,
    completed: session.completed,
    noteText: session.noteText,
    tags: session.tags.join(', '),
    taskTitle: session.taskTitle,
    createdAt: session.createdAt,
  }))

  return Papa.unparse(data)
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

#### Import: CSV to Sessions

```typescript
// src/utils/csvImport.ts
import Papa from 'papaparse'
import { SessionRecord } from '../types/session'

interface CSVRow {
  id?: string
  startTimestamp: string
  endTimestamp: string
  plannedDurationSeconds: string
  actualDurationSeconds: string
  durationString: string
  mode: string
  startType: string
  completed: string
  noteText: string
  tags: string
  taskTitle: string
  createdAt: string
}

export function parseCSVFile(file: File): Promise<SessionRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parse errors: ${results.errors.map(e => e.message).join(', ')}`))
          return
        }

        const sessions: SessionRecord[] = results.data.map(row => ({
          id: row.id || crypto.randomUUID(),
          startTimestamp: row.startTimestamp,
          endTimestamp: row.endTimestamp,
          plannedDurationSeconds: parseInt(row.plannedDurationSeconds, 10),
          actualDurationSeconds: parseInt(row.actualDurationSeconds, 10),
          durationString: row.durationString,
          mode: row.mode as 'focus',
          startType: row.startType as 'manual' | 'auto',
          completed: row.completed === 'true',
          noteText: row.noteText || '',
          tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          taskTitle: row.taskTitle || '',
          createdAt: row.createdAt ? parseInt(row.createdAt, 10) : Date.now(),
        }))

        resolve(sessions)
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}
```

### Redux Integration

#### New Streak Slice (Optional — can be derived selector)

```typescript
// src/features/stats/streakSlice.ts
import { createSlice, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { calculateStreak } from '../../utils/streakUtils'
import { selectAllSessions } from '../history/historySelectors'

interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  activeDates: string[]
}

const initialState: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  activeDates: [],
}

export const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    updateStreak: (state, action) => {
      state.currentStreak = action.payload.currentStreak
      state.longestStreak = action.payload.longestStreak
      state.lastActiveDate = action.payload.lastActiveDate
      state.activeDates = Array.from(action.payload.activeDates)
    },
  },
})

export const { updateStreak } = streakSlice.actions

// Selector that derives streak from sessions (no separate state needed)
export const selectStreak = createSelector(
  [selectAllSessions],
  (sessions) => calculateStreak(sessions)
)

export default streakSlice.reducer
```

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| papaparse | 5.4.x | React 18, TypeScript, Vite | ESM + CJS, no React peer dep |
| styled-components | 6.3.x | Already in project | Use existing theme tokens |
| @reduxjs/toolkit | 2.5.x | Already in project | Use existing patterns |
| React | 18.3.x | Already in project | No changes needed |

---

## Implementation Approach

### Option 1: Minimal Dependencies (Recommended)

1. **Streak calculation**: Add `streakUtils.ts` with pure functions
2. **Calendar UI**: Custom styled-components grid (not a library)
3. **CSV**: Use `papaparse` only

**Bundle impact:**
- papaparse: ~8KB gzipped
- Custom calendar: ~100-200 LOC, no additional bundle

**Total new dependencies: 1** (papaparse)

### Option 2: If Calendar Library Needed Later

Only add if requirements expand beyond simple streak display (e.g., date range picker, multiple month view with complex interactions).

| Library | Size | Use Case |
|---------|------|----------|
| react-calendar | ~50KB | Full calendar features |
| dayzed | ~8KB | Lightweight, headless |

For current requirements (show which days have sessions), custom component is best.

---

## Sources

- [papaparse npm](https://www.npmjs.com/package/papaparse) — v5.4.1 current (2025)
- [papaparse TypeScript](https://www.papaparse.com/docs#typescript) — Types included in package
- [MDN Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) — Native Date API sufficient
- Existing codebase: `src/utils/dateUtils.ts`, `src/utils/statsUtils.ts`, `src/services/sessionStore.ts`

---

*Research for: Pomodoro Timer v2.2 Streak Tracking + CSV Export/Import*
*Researched: 2026-02-23*
