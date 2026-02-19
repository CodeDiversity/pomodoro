# Architecture Research

**Domain:** Pomodoro Timer Web Application
**Researched:** 2026-02-19
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  TimerView   │  │  HistoryView │  │   StatsView  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
├─────────┴─────────────────┴──────────────────┴───────────────┤
│                    Component Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ TimerDisplay │  │ SessionCard  │  │ StatsChart  │        │
│  │ TimerControls│  │ NoteEditor   │  │ FilterBar   │        │
│  │ SessionType  │  │ HistoryList  │  │ DatePicker  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   Hook Layer (Custom)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ useTimer     │  │ useSessions  │  │ useStats     │        │
│  │ useLocalStore│  │ useNotes     │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              localStorage Service                    │   │
│  │   - Timer State    - Sessions    - Settings          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `TimerView` | Main timer screen with display, controls, session type selector | Container component, manages timer state |
| `TimerDisplay` | Visual countdown display (MM:SS), progress ring/bar | Presentational, receives time as props |
| `TimerControls` | Start, Pause, Reset, Skip buttons | Presentational, emits events to parent |
| `SessionTypeSelector` | Toggle between Focus/Short Break/Long Break | Presentational, controlled by parent state |
| `HistoryView` | List of completed sessions with filtering | Container, manages filter state |
| `HistoryList` | Virtualized list of session cards | Presentational, maps over sessions array |
| `SessionCard` | Individual session display (type, duration, notes preview) | Presentational component |
| `NoteEditor` | Text input for session notes (during/after session) | Controlled input, saves on change/blur |
| `StatsView` | Aggregated statistics and charts | Container, computes stats from sessions |
| `StatsChart` | Visual representation of focus time | Presentational, receives computed stats |
| `FilterBar` | Date range, session type filters | Presentational, emits filter changes |
| `TabNavigation` | Top-level navigation between Timer/History/Stats | Presentational, controlled active tab |

## Recommended Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/              # Shared components (Button, Card, etc.)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── timer/               # Timer-specific components
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   ├── SessionTypeSelector.tsx
│   │   └── index.ts
│   ├── history/             # History-related components
│   │   ├── SessionCard.tsx
│   │   ├── HistoryList.tsx
│   │   ├── FilterBar.tsx
│   │   └── index.ts
│   ├── stats/               # Stats-related components
│   │   ├── StatsChart.tsx
│   │   ├── StatsSummary.tsx
│   │   └── index.ts
│   └── layout/              # Layout components
│       ├── TabNavigation.tsx
│       └── index.ts
├── hooks/                   # Custom React hooks
│   ├── useTimer.ts          # Timer logic (interval, states)
│   ├── useLocalStorage.ts   # localStorage persistence
│   ├── useSessions.ts       # Session CRUD operations
│   ├── useNotes.ts          # Session notes management
│   ├── useStats.ts          # Statistics computations
│   └── index.ts
├── services/                # Business logic and data layer
│   ├── storage.ts           # localStorage service
│   ├── timer.ts             # Timer calculations/helpers
│   └── stats.ts             # Stats calculation helpers
├── types/                   # TypeScript type definitions
│   ├── timer.ts             # Timer types (SessionType, TimerState)
│   ├── session.ts           # Session types
│   └── index.ts
├── context/                 # React Context providers
│   ├── ThemeContext.tsx     # Dark mode theme context
│   └── index.ts
├── styles/                  # Global styles and theme
│   ├── theme.ts             # Theme constants (colors, spacing)
│   ├── GlobalStyles.ts      # Global styled-components
│   └── index.ts
├── utils/                   # Utility functions
│   ├── time.ts              # Time formatting (MM:SS)
│   ├── date.ts              # Date utilities
│   └── index.ts
├── App.tsx                  # Main app component
├── main.tsx                 # Entry point
└── vite-env.d.ts            # Vite type declarations
```

### Structure Rationale

- **`components/`:** Organized by feature domain (timer, history, stats) following feature-based architecture. Common components shared across features.
- **`hooks/`:** Custom hooks encapsulate business logic, keeping components thin. Each hook has single responsibility.
- **`services/`:** Pure business logic separated from React components. Easy to unit test.
- **`types/`:** Centralized TypeScript definitions ensure consistency across the app.
- **`context/`:** Theme context for dark mode (single source of truth for theme).
- **`styles/`:** Theme constants and global styles in one place.
- **`utils/`:** Pure helper functions with no side effects.

## Architectural Patterns

### Pattern 1: Custom Hook for Timer Logic

**What:** Encapsulate timer state and interval management in a custom hook.
**When:** Managing any time-based state in React.
**Trade-offs:** PRO: Reusable, testable, clean separation. CON: Slight learning curve for team members unfamiliar with hooks.

**Example:**
```typescript
// hooks/useTimer.ts
interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(initialTime: number): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(t => Math.max(0, t - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return { timeRemaining, isRunning, start, pause, reset };
}
```

### Pattern 2: Custom Hook for localStorage Persistence

**What:** Generic hook that syncs React state with localStorage.
**When:** Any state that needs to persist across sessions.
**Trade-offs:** PRO: Automatic persistence, declarative API. CON: localStorage is synchronous (blocks UI), limited to ~5MB.

**Example:**
```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [storedValue, setValue];
}
```

### Pattern 3: Container/Presentational Pattern

**What:** Separate components that manage state (containers) from those that only render UI (presentational).
**When:** Any feature with nontrivial state management.
**Trade-offs:** PRO: Clear separation of concerns, easier testing, better reusability. CON: More files to manage.

**Example:**
```typescript
// TimerView (Container - manages state)
function TimerView() {
  const { timeRemaining, isRunning, start, pause, reset } = useTimer(25 * 60);
  const [sessionType, setSessionType] = useState<SessionType>('focus');

  const handleSessionChange = (type: SessionType) => {
    setSessionType(type);
    reset(); // Reset timer when changing session type
  };

  return (
    <div>
      <SessionTypeSelector value={sessionType} onChange={handleSessionChange} />
      <TimerDisplay time={timeRemaining} />
      <TimerControls isRunning={isRunning} onStart={start} onPause={pause} onReset={reset} />
    </div>
  );
}

// TimerDisplay (Presentational - only renders)
interface TimerDisplayProps {
  time: number;
}

function TimerDisplay({ time }: TimerDisplayProps) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return <div>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>;
}
```

## Data Flow

### Timer Flow

```
[User clicks Start]
       ↓
[TimerControls] emits onStart
       ↓
[TimerView (Container)] calls start() from useTimer hook
       ↓
[useTimer] sets isRunning = true, starts setInterval
       ↓
[useTimer] calls setTimeRemaining every second
       ↓
[TimerView] re-renders with new timeRemaining
       ↓
[TimerDisplay] receives new time, formats and displays
```

### Session Persistence Flow

```
[Timer completes (timeRemaining = 0)]
       ↓
[useTimer] detects completion, emits onComplete callback
       ↓
[TimerView] calls addSession from useSessions hook
       ↓
[useSessions] creates session object with metadata
       ↓
[useSessions] calls saveToStorage from storage service
       ↓
[storage service] writes to localStorage
       ↓
[HistoryView] subscribes to sessions, re-renders with new session
```

### Notes Flow

```
[User types in NoteEditor]
       ↓
[NoteEditor] calls onChange with text value
       ↓
[TimerView/HistoryView] debounces and saves
       ↓
[useNotes] calls updateNote in storage service
       ↓
[storage service] updates session in localStorage
```

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                     React Context                            │
│                    (ThemeContext)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Custom Hooks (State)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ useTimer   │  │ useSessions│  │ useStats   │           │
│  │ - time     │  │ - sessions │  │ - stats    │           │
│  │ - isRunning│  │ - add/update│ │ - compute  │           │
│  └─────┬──────┘  └──────┬───────┘  └─────┬──────┘           │
│        │                │                │                   │
├────────┴────────────────┴────────────────┴───────────────────┤
│                    localStorage Service                       │
│  - Timer: current time, running state                        │
│  - Sessions: array of completed sessions                    │
│  - Settings: theme, durations                               │
└─────────────────────────────────────────────────────────────┘
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single-page app with localStorage is perfectly adequate. No backend needed. |
| 1k-100k users | Consider moving to IndexedDB for larger session history. Add session export/import. |
| 100k+ users | Would need backend. Data model would shift to server-first with offline sync. |

### Scaling Priorities

1. **First bottleneck:** localStorage capacity (~5MB). When to fix: At ~5000+ sessions. How: Migrate to IndexedDB.
2. **Second bottleneck:** Performance with large session lists. When to fix: When History view lags. How: Virtualize list, paginate, or add date range filters.
3. **Third bottleneck:** Timer drift from setInterval. When to fix: If precise timing critical. How: Use Web Workers or compare against Date.now().

## Anti-Patterns

### Anti-Pattern 1: Storing Timer in localStorage Every Second

**What people do:** Writing to localStorage inside the setInterval callback.
**Why it's wrong:** localStorage is synchronous and blocks the main thread. Writing every second causes performance issues and potential jank.
**Do this instead:** Only persist on session complete, pause, or page unload. Keep running state in memory.

### Anti-Pattern 2: Timer Component Managing All State

**What people do:** Putting all timer logic, session management, notes, and UI in one massive component.
**Why it's wrong:** Violates single responsibility, impossible to test in isolation, hard to maintain.
**Do this instead:** Use custom hooks to separate concerns. Use container/presentational pattern.

### Anti-Pattern 3: Ignoring Browser Tab Visibility

**What people do:** Only relying on setInterval which throttles in background tabs.
**Why it's wrong:** Timer stops or slows dramatically when user switches tabs.
**Do this instead:** Calculate elapsed time against Date.now() or use visibilitychange event to adjust.

### Anti-Pattern 4: Not Debouncing Note Saves

**What people do:** Saving to localStorage on every keystroke.
**Why it's wrong:** Excessive writes, potential performance issues.
**Do this instead:** Debounce note saves (300-500ms) or save on blur.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Browser Notifications | Request permission on first start, trigger on timer complete | Must handle permission denied gracefully |
| Web Audio API | Play sound on timer complete | Preload audio for instant playback |
| IndexedDB | Use for larger data than localStorage allows | Consider at ~5000+ sessions |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| TimerView ↔ HistoryView | Shared useSessions hook via parent or context | Both need access to sessions array |
| TimerView ↔ StatsView | Shared useSessions hook | Stats computes from sessions |
| TabNavigation ↔ Views | Controlled component pattern | Parent manages activeTab state |

## Build Order and Dependencies

For the Pomodoro Timer app, suggested build order:

1. **Phase 1: Foundation**
   - Types and theme setup
   - Basic component structure
   - localStorage service

2. **Phase 2: Core Timer**
   - useTimer hook (isolated logic)
   - TimerDisplay, TimerControls
   - SessionTypeSelector
   - TimerView container

3. **Phase 3: Session Persistence**
   - useSessions hook
   - Session storage in localStorage
   - Auto-save on timer complete

4. **Phase 4: Notes**
   - NoteEditor component
   - useNotes hook
   - Link notes to sessions

5. **Phase 5: History**
   - HistoryList component
   - SessionCard component
   - FilterBar component
   - HistoryView container

6. **Phase 6: Stats**
   - useStats computation hook
   - StatsChart component
   - StatsSummary component
   - StatsView container

7. **Phase 7: Polish**
   - TabNavigation
   - Theme integration
   - Final integration testing

### Dependency Graph

```
types/          → (no dependencies)
  ↓
services/       → types/
  ↓
hooks/          → types/, services/
  ↓
components/    → hooks/, types/
  ↓
App.tsx         → components/, hooks/, context/
```

## Sources

- [React Documentation - State and Lifecycle](https://react.dev/learn/state-a-components-memory)
- [React Hooks API Reference](https://react.dev/reference/react)
- [MDN - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN - Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [styled-components Documentation](https://styled-components.com/docs)

---

*Architecture research for: Pomodoro Timer Web Application*
*Researched: 2026-02-19*
