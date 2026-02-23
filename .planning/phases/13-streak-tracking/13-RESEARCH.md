# Phase 13: Streak Tracking - Research

**Researched:** 2026-02-23
**Domain:** Streak tracking, calendar heatmap visualization, IndexedDB persistence
**Confidence:** HIGH

## Summary

This phase implements daily focus streak tracking and a calendar heatmap for the Pomodoro Timer app. The implementation will use Redux Toolkit (following existing patterns from v2.1) with IndexedDB persistence. Sessions are already stored with timestamps, so streak calculation can be derived from the existing `sessions` store. The calendar heatmap will be a custom CSS grid component following the GitHub contribution graph pattern. Streak protection requires additional state to track when a "free day" has been used.

**Primary recommendation:** Create a new `streakSlice` Redux slice with persistence middleware, add calendar heatmap component to Stats view, and extend the IndexedDB schema to version 4 for streak data storage.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Current streak count displays in Stats view (primary location)
- Best (longest) streak displays below current streak in Stats view
- Streak counts update automatically after each completed focus session
- Use flame/fire icon next to current streak for visual appeal
- Monthly grid layout showing current month by default
- Left/right navigation arrows to browse months
- Color coding: no sessions (gray/empty), 1-2 sessions (light blue), 3-4 sessions (medium blue), 5+ sessions (dark blue)
- Today highlighted with border
- Tooltip on hover shows exact session count and total duration for that day
- Day boundary: midnight local time (user's timezone)
- A day counts as active if user completes at least one session of 5+ minutes
- Consecutive days: streak continues if activity occurs each calendar day
- Best streak: tracks highest consecutive day count ever achieved
- Streak recalculates on app load from session history
- Streak protection activates when current streak reaches 5+ days
- If user misses one day, streak pauses at current count instead of resetting to 0
- Protection can be used once per streak (not cumulative)
- Visual indicator shows when streak protection is active (shield icon)
- After using protection, next missed day resets streak normally
- Streak data stored in IndexedDB alongside session history
- Data loads on app initialization

### Claude's Discretion
- Exact icon designs and animations
- Calendar grid CSS/layout implementation
- Tooltip positioning and styling
- How to display "streak protection active" state visually
- Exact color hex values for heatmap levels

### Deferred Ideas (OUT OF SCOPE)
None — all decisions within Phase 13 scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STRK-01 | Current streak displayed in header/stats view | Redux slice with streak state, updated on session complete |
| STRK-02 | Best (longest) streak tracked and displayed | Persisted in IndexedDB, calculated from session history |
| STRK-03 | Streak calculated based on consecutive days with focus sessions (minimum 5 minutes) | Streak calculation logic using session timestamps |
| STRK-04 | Streak calendar view showing monthly grid with daily activity | Custom CSS grid component, similar to GitHub contribution graph |
| STRK-05 | Calendar color coding: light blue (1-2 sessions) -> dark blue (5+ sessions) | CSS classes or inline styles based on session count |
| STRK-06 | Streak protection: 1 free miss allowed for 5+ day streaks | Streak state includes protectionUsed flag |
| STRK-07 | Streak data persisted to IndexedDB | New IndexedDB store or extend existing schema |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.2.0 | UI framework | Current project dependency |
| Redux Toolkit | ^2.0.0 | State management | Already in use (v2.1) |
| idb | ^8.0.0 | IndexedDB wrapper | Already in use (db.ts) |
| styled-components | ^6.x | Styling | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^3.x | Date manipulation | For calendar heatmap calculations |
| react-icons | ^5.x | Icon library | For flame/shield icons |

**Installation:**
```bash
npm install date-fns react-icons
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   ├── streak/
│   │   ├── streakSlice.ts      # Redux slice for streak state
│   │   ├── streakSelectors.ts  # Memoized selectors
│   │   ├── streakMiddleware.ts # Persistence middleware
│   │   └── useStreak.ts        # Hook for streak data
│   └── history/
│       └── useSessionHistory.ts # Existing - used to get session data
├── components/
│   └── stats/
│       ├── StreakDisplay.tsx   # Current/best streak display
│       └── CalendarHeatmap.tsx # Monthly calendar grid
├── services/
│   ├── streakStore.ts          # Streak-specific IndexedDB operations
│   └── db.ts                   # Existing - extend schema
└── utils/
    └── streakUtils.ts          # Streak calculation logic
```

### Pattern 1: Redux Slice with Persistence Middleware
**What:** Create a streakSlice following the same pattern as timerSlice and sessionSlice, with a persistence middleware that debounces saves to IndexedDB.

**When to use:** When state needs to persist across app restarts but doesn't need immediate persistence.

**Example:**
```typescript
// src/features/streak/streakSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;  // ISO date string (YYYY-MM-DD)
  protectionUsed: boolean;
  isLoaded: boolean;
}

const initialState: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  protectionUsed: false,
  isLoaded: false,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    updateStreak(state, action: PayloadAction<{
      currentStreak: number;
      bestStreak: number;
      lastActiveDate: string;
      protectionUsed: boolean;
    }>) {
      state.currentStreak = action.payload.currentStreak;
      state.bestStreak = action.payload.bestStreak;
      state.lastActiveDate = action.payload.lastActiveDate;
      state.protectionUsed = action.payload.protectionUsed;
      state.isLoaded = true;
    },
    loadStreak(state, action: PayloadAction<StreakState>) {
      return { ...action.payload, isLoaded: true };
    },
    useProtection(state) {
      state.protectionUsed = true;
    },
  },
});

export const { updateStreak, loadStreak, useProtection } = streakSlice.actions;
export default streakSlice.reducer;
```

### Pattern 2: Streak Calculation Logic
**What:** Calculate current and best streaks from session history by grouping sessions by date and checking for consecutive days.

**When to use:** On app load and after each session completion.

**Example:**
```typescript
// src/utils/streakUtils.ts
import { SessionRecord } from '../types/session';

interface DailyActivity {
  date: string;  // YYYY-MM-DD
  sessionCount: number;
  totalSeconds: number;
}

export function groupSessionsByDay(sessions: SessionRecord[]): Map<string, DailyActivity> {
  const dailyMap = new Map<string, DailyActivity>();

  for (const session of sessions) {
    if (!session.completed || session.actualDurationSeconds < 300) continue; // Skip < 5 min

    const date = new Date(session.startTimestamp).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { date, sessionCount: 0, totalSeconds: 0 };

    dailyMap.set(date, {
      date,
      sessionCount: existing.sessionCount + 1,
      totalSeconds: existing.totalSeconds + session.actualDurationSeconds,
    });
  }

  return dailyMap;
}

export function calculateStreaks(
  dailyActivity: Map<string, DailyActivity>,
  currentStreak: number,
  bestStreak: number,
  lastActiveDate: string | null,
  protectionUsed: boolean
): { currentStreak: number; bestStreak: number; lastActiveDate: string | null; protectionUsed: boolean } {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if today or yesterday has activity
  const hasActivityToday = dailyActivity.has(today);
  const hasActivityYesterday = dailyActivity.has(yesterday);

  if (!hasActivityToday && !hasActivityYesterday) {
    // No recent activity - streak may be broken
    if (lastActiveDate) {
      const daysSince = Math.floor(
        (new Date(today).getTime() - new Date(lastActiveDate).getTime()) / 86400000
      );

      if (daysSince > 1) {
        // More than 1 day gap - streak broken
        if (currentStreak >= 5 && !protectionUsed) {
          // Use protection - keep streak but mark protection as used
          return { currentStreak, bestStreak, lastActiveDate, protectionUsed: true };
        } else {
          // Reset streak
          return { currentStreak: 0, bestStreak, lastActiveDate, protectionUsed: false };
        }
      }
    }
    return { currentStreak, bestStreak, lastActiveDate, protectionUsed };
  }

  // Has activity - check if it's a new day
  if (hasActivityToday && lastActiveDate !== today) {
    const newStreak = (lastActiveDate === yesterday) ? currentStreak + 1 : 1;
    const newBest = Math.max(newStreak, bestStreak);

    // Reset protection if streak was broken and reset
    const newProtectionUsed = (lastActiveDate && newStreak === 1) ? false : protectionUsed;

    return {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastActiveDate: today,
      protectionUsed: newProtectionUsed,
    };
  }

  return { currentStreak, bestStreak, lastActiveDate, protectionUsed };
}
```

### Pattern 3: Calendar Heatmap Component
**What:** A monthly calendar grid that shows activity intensity using color coding.

**When to use:** Displaying daily activity history in the Stats view.

**Example:**
```typescript
// src/components/stats/CalendarHeatmap.tsx
import { useMemo, useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import styled from 'styled-components';

interface CalendarHeatmapProps {
  dailyActivity: Map<string, { sessionCount: number; totalSeconds: number }>;
}

const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MonthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayCell = styled.div<{ $intensity: number; $isToday: boolean }>`
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: ${props => {
    if (props.$intensity === 0) return '#e5e7eb';
    if (props.$intensity <= 2) return '#bfdbfe';  // light blue
    if (props.$intensity <= 4) return '#60a5fa';   // medium blue
    return '#136dec';                              // dark blue
  }};
  border: ${props => props.$isToday ? '2px solid #136dec' : 'none'};
  cursor: pointer;
  position: relative;

  &:hover::after {
    content: '${props => props.$intensity} sessions';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

export function CalendarHeatmap({ dailyActivity }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const today = new Date();

  return (
    <HeatmapContainer>
      <MonthHeader>
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}>
          ←
        </button>
        <span>{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}>
          →
        </button>
      </MonthHeader>
      <CalendarGrid>
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const activity = dailyActivity.get(dateKey);
          const sessionCount = activity?.sessionCount || 0;

          return (
            <DayCell
              key={dateKey}
              $intensity={sessionCount}
              $isToday={isSameDay(day, today)}
              title={`${dateKey}: ${sessionCount} sessions`}
            />
          );
        })}
      </CalendarGrid>
    </HeatmapContainer>
  );
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date manipulation | Custom date functions | date-fns | Comprehensive, tree-shakeable, well-tested |
| Icons | Custom SVG icons | react-icons | Consistent, easy to swap, includes flame/shield |
| IndexedDB operations | Raw IndexedDB API | idb library | Already in use, Promise-based, typed |

## Common Pitfalls

### Pitfall 1: Timezone Issues with Date Boundaries
**What goes wrong:** Streak calculation uses wrong day boundary, causing streaks to break unexpectedly.

**Why it happens:** JavaScript dates are tricky - `new Date().toISOString()` returns UTC, not local time.

**How to avoid:** Use date-fns functions like `format(date, 'yyyy-MM-dd')` which handle local timezone correctly, or explicitly use local date construction:
```typescript
const today = new Date();
const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const dateString = localDate.toISOString().split('T')[0];
```

### Pitfall 2: Forgetting Session Duration Check
**What goes wrong:** Sessions under 5 minutes are counted toward streak, violating STRK-03.

**Why it happens:** Forgetting to filter by `actualDurationSeconds >= 300`.

**How to avoid:** Always check duration in the session filtering logic.

### Pitfall 3: Streak Protection State Not Persisting
**What goes wrong:** Protection used status resets on app restart, allowing unlimited protection.

**Why it happens:** Protection status not saved to IndexedDB with streak data.

**How to avoid:** Include `protectionUsed` in the persisted streak state.

### Pitfall 4: Race Condition on Session Complete
**What goes wrong:** Streak updates before session is saved to IndexedDB, causing streak to calculate from stale data.

**Why it happens:** Redux action dispatched before session save completes.

**How to avoid:** Wait for session save to complete before updating streak, or listen for session save completion.

## Code Examples

### Extending IndexedDB Schema
```typescript
// src/services/db.ts - Add to upgrade function
if (oldVersion < 4) {
  if (!db.objectStoreNames.contains('streak')) {
    db.createObjectStore('streak', { keyPath: 'id' })
  }
}
```

### Streak Persistence Service
```typescript
// src/services/streakStore.ts
import { initDB } from './db';

const STREAK_KEY = 'current';

export interface StreakData {
  id: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  protectionUsed: boolean;
  version: number;
}

export async function saveStreak(streak: Omit<StreakData, 'id' | 'version'>): Promise<void> {
  const db = await initDB();
  await db.put('streak', {
    id: STREAK_KEY,
    ...streak,
    version: 1,
  });
}

export async function loadStreak(): Promise<StreakData | undefined> {
  const db = await initDB();
  return db.get('streak', STREAK_KEY);
}
```

### Listening for Session Complete
```typescript
// In timer completion handler or session save hook
const handleSessionComplete = async (session: SessionRecord) => {
  await saveSession(session);  // Save session first

  // Then recalculate streak
  const sessions = await getAllSessions();
  const dailyActivity = groupSessionsByDay(sessions);
  const newStreakData = calculateStreaks(
    dailyActivity,
    currentStreak,
    bestStreak,
    lastActiveDate,
    protectionUsed
  );

  dispatch(updateStreak(newStreakData));
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No streak tracking | Redux slice + IndexedDB | Phase 13 | New feature |
| Sessions in localStorage | Sessions in IndexedDB via idb | Phase 6-7 | Better querying, indexed sorting |

**Deprecated/outdated:**
- None relevant to this phase.

## Open Questions

1. **When to recalculate streak?**
   - What we know: Need to recalculate on app load and after session completion
   - What's unclear: Should streak also recalculate when sessions are imported/deleted?
   - Recommendation: Yes, recalculate whenever session list changes (via listener or explicit call)

2. **Handling timezone changes?**
   - What we know: Day boundary is "midnight local time"
   - What's unclear: What if user travels across timezones?
   - Recommendation: Use local date at time of calculation, store dates as YYYY-MM-DD strings

3. **Initial streak calculation for existing users?**
   - What we know: App may have existing sessions in IndexedDB
   - What's unclear: Should existing sessions count toward initial streak?
   - Recommendation: Yes, calculate from all historical sessions on first load

## Sources

### Primary (HIGH confidence)
- Project existing code: src/app/store.ts - Redux pattern
- Project existing code: src/services/db.ts - IndexedDB schema
- Project existing code: src/services/sessionStore.ts - Session operations
- date-fns documentation - Date manipulation functions

### Secondary (MEDIUM confidence)
- React patterns for calendar components - Standard approach
- GitHub contribution graph pattern - Visual inspiration

### Tertiary (LOW confidence)
- Streak protection logic patterns from other apps - General concept

---

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing project dependencies and patterns
- Architecture: HIGH - Follows established Redux slice pattern from v2.1
- Pitfalls: HIGH - Based on common JavaScript date handling issues

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days for stable feature)
