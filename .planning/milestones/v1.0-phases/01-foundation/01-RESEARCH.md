# Phase 1: Foundation - Research

**Researched:** 2026-02-19
**Domain:** Pomodoro Timer Web Application - Core Foundation
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational Pomodoro timer with countdown display, session modes, state persistence, notifications, and keyboard shortcuts. The core technical challenge is implementing accurate timer logic that handles background tab throttling, persists state across refreshes using IndexedDB (per locked decision), and provides proper notification handling. The recommended stack is React 19 + Vite + TypeScript + styled-components, with IndexedDB for persistence via the `idb` wrapper library.

**Primary recommendation:** Use timestamp-based timer calculation with IndexedDB persistence and Web Audio API for notifications. This ensures accuracy across background tabs and provides robust local storage.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Timer Display
- MM:SS digital format (e.g., "25:00")
- Bold & prominent visual style — large numbers as the hero element
- Mode displayed with both text badge and color-coded background
- Session counter shown (e.g., "Session 2 of 4")

#### Timer Controls
- Minimal visible controls: Play/Pause button only
- Other controls (Reset, Skip) in a menu
- Buttons use icons + text labels
- Keyboard shortcuts shown in a help panel (not on buttons)
- Skip advances directly to next session (Focus → Break or Break → Focus)

#### Persistence
- Save: time remaining, current mode, session count, last active timestamp
- Storage: IndexedDB
- On corrupted data: reset to defaults
- Save frequency: every few seconds (balance accuracy and performance)

#### Notifications
- Audio: system beep (no custom sound file needed)
- Browser notification permission: explicit prompt before first session
- Notification content: "Pomodoro Timer" as title, session type + encouragement in body
- Behavior: always notify, even when tab is in background

### Claude's Discretion
- Exact font choices and typography
- Color palette for mode indicators (user said "color coded")
- Help panel UI/UX details
- IndexedDB schema specifics

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TMR-01 | Timer displays time in MM:SS format | TimerDisplay component with time formatting utility |
| TMR-02 | Timer supports three modes: Focus (25:00), Short Break (5:00), Long Break (15:00) | Session mode constants and timer state management |
| TMR-03 | After 4 focus sessions, auto-select Long Break; otherwise Short Break | Pomodoro cycle logic in timer state |
| TMR-04 | Start control begins countdown | TimerControls component, useTimer hook |
| TMR-05 | Pause control stops countdown temporarily | TimerControls component, useTimer hook |
| TMR-06 | Resume control continues from paused time | Timer state preservation in useTimer |
| TMR-07 | Skip control ends current session early and moves to next | Skip handler in TimerView |
| TMR-08 | Reset control returns to initial duration for current mode | Reset handler in useTimer |
| TMR-09 | Display shows current mode (Focus/Short Break/Long Break) | SessionTypeSelector with visual indicators |
| TMR-10 | Display shows session count (e.g., "Focus #2") | Session counter state in timer |
| TMR-11 | Auto-start toggle option (off by default) starts next session automatically | Settings state, auto-start logic |
| TMR-12 | Timer persists running state across page refresh (store lastTick timestamp) | IndexedDB persistence with timestamp |
| NOTF-01 | Play audible beep when session ends | Web Audio API oscillator for system beep |
| NOTF-02 | Request browser notification permission on first interaction | Notification permission handler |
| NOTF-03 | Send browser notification when session ends (if permitted) | Notification API implementation |
| KEY-01 | Space key toggles Start/Pause/Resume | Keyboard event handler in App |
| KEY-02 | Enter key saves note when focus is on note field (prevent form submit) | Prevented in Phase 2 |
| KEY-03 | Cmd/Ctrl+K focuses search box in history | Keyboard handler for history (Phase 3) |
| DATA-01 | localStorage schema with version number | Actually: IndexedDB per locked decision |
| DATA-02 | Migration stub for future schema changes | Schema versioning in IndexedDB |
| DATA-03 | Settings stored: durations, auto-start preference | Settings in IndexedDB |

</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI Framework | Current stable (19.2.4 released Jan 2026). Industry standard for web apps. |
| TypeScript | 5.x | Type Safety | Essential for timer logic and data models. Catches errors at compile time. |
| Vite | 7.x | Build Tool | Latest stable (v7.3.1). Native ES modules, instant server start. Industry standard. |
| styled-components | 6.x | CSS-in-JS | Theming support built-in, dynamic styling based on props. |
| idb | ^8.x | IndexedDB Wrapper | Lightweight promise-based wrapper for IndexedDB. Standard for modern React apps. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid | ^10.x | Unique IDs | Generating session IDs for history records |
| Vitest | 4.x | Testing | Vite-native testing framework |

### Installation

```bash
# Create Vite project with React TypeScript
npm create vite@latest pomodoro -- --template react-ts

# Core dependencies
npm install react react-dom

# Supporting libraries
npm install styled-components idb uuid

# Dev dependencies
npm install -D typescript @types/react @types/react-dom @types/uuid vite
```

### Stack vs. Context Decision

The general stack research recommends localStorage, but **CONTEXT.md explicitly locks IndexedDB** as the storage solution. This is the correct decision for this app because:
- Larger storage capacity (hundreds of MB vs 5-10MB)
- Asynchronous API (non-blocking)
- Better for storing session history over time
- More robust data integrity

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── common/              # Button, Card, Badge, etc.
│   ├── timer/
│   │   ├── TimerDisplay.tsx
│   │   ├── TimerControls.tsx
│   │   ├── SessionTypeSelector.tsx
│   │   ├── SessionCounter.tsx
│   │   ├── HelpPanel.tsx
│   │   └── index.ts
│   └── layout/
│       └── index.ts
├── hooks/
│   ├── useTimer.ts
│   ├── useKeyboardShortcuts.ts
│   └── index.ts
├── services/
│   ├── db.ts               # IndexedDB service
│   ├── notifications.ts    # Notification helpers
│   └── audio.ts            # Audio beep helpers
├── types/
│   ├── timer.ts
│   └── index.ts
├── utils/
│   ├── time.ts             # MM:SS formatting
│   └── index.ts
├── styles/
│   ├── theme.ts
│   └── GlobalStyles.ts
├── App.tsx
└── main.tsx
```

### Pattern 1: Timestamp-Based Timer

**What:** Calculate remaining time from a start timestamp, not tick counting.
**When to use:** Any timer that must remain accurate even in background tabs.
**Why:** Browsers throttle setInterval in background tabs; timestamp comparison is immune to this.

```typescript
// Timestamp-based timer state
interface TimerState {
  mode: 'focus' | 'shortBreak' | 'longBreak';
  startTime: number | null;      // When timer started (Date.now())
  pausedAt: number | null;       // When paused (for resume)
  duration: number;              // Total duration in seconds
  sessionCount: number;          // Current session number (1-4)
  isRunning: boolean;
}

// Calculate remaining time
function getRemainingTime(state: TimerState): number {
  if (!state.isRunning) {
    return state.pausedAt ?? state.duration;
  }
  if (!state.startTime) return state.duration;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  return Math.max(0, state.duration - elapsed);
}
```

**Source:** [MDN: Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now) - Reliable timestamp comparison

### Pattern 2: IndexedDB with idb Wrapper

**What:** Use the `idb` library for promise-based IndexedDB access.
**When to use:** When CONTEXT.md locks IndexedDB as the storage solution.

```typescript
// services/db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PomodoroDB extends DBSchema {
  timerState: {
    key: string;
    value: {
      id: string;
      mode: string;
      startTime: number | null;
      pausedAt: number | null;
      duration: number;
      sessionCount: number;
      isRunning: boolean;
      lastSaved: number;
    };
  };
  settings: {
    key: string;
    value: {
      id: string;
      focusDuration: number;
      shortBreakDuration: number;
      longBreakDuration: number;
      autoStart: boolean;
    };
  };
}

const DB_NAME = 'pomodoro-timer';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PomodoroDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<PomodoroDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PomodoroDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Timer state store
        if (!db.objectStoreNames.contains('timerState')) {
          db.createObjectStore('timerState', { keyPath: 'id' });
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Save timer state
export async function saveTimerState(state: TimerState): Promise<void> {
  const db = await getDB();
  await db.put('timerState', {
    id: 'current',
    ...state,
    lastSaved: Date.now(),
  });
}

// Load timer state
export async function loadTimerState(): Promise<TimerState | null> {
  const db = await getDB();
  const state = await db.get('timerState', 'current');
  return state || null;
}
```

**Source:** [idb npm package](https://www.npmjs.com/package/idb) - Promise-based IndexedDB wrapper

### Pattern 3: Notification Permission Flow

**What:** Request notification permission on first user interaction, not on page load.
**When to use:** Browser notifications requirement (NOTF-02).

```typescript
// services/notifications.ts
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'pomodoro-timer',
      requireInteraction: true,
    });
  }
}
```

**Source:** [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

### Pattern 4: Web Audio API Beep

**What:** Use OscillatorNode for system beep without external audio files.
**When to use:** NOTF-01 requires audio notification.

```typescript
// services/audio.ts
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playBeep(): void {
  const ctx = getAudioContext();

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Configure beep
  oscillator.frequency.value = 880; // A5 note
  oscillator.type = 'sine';

  // Volume envelope (fade out)
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  // Play for 500ms
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.5);
}
```

**Source:** [MDN: Web Audio API - OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode)

### Pattern 5: Global Keyboard Shortcuts

**What:** Attach keyboard event listeners at document level for global shortcuts.
**When to use:** KEY-01 (Space to toggle), KEY-03 (Cmd+K for search).

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onToggle: () => void;
  onSearchFocus?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onToggle,
  onSearchFocus,
  enabled = true,
}: UseKeyboardShortcutsProps): void {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // KEY-01: Space to toggle (only when not in input)
    if (e.code === 'Space' && !isInput) {
      e.preventDefault();
      onToggle();
    }

    // KEY-03: Cmd/Ctrl+K for search focus
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onSearchFocus?.();
    }
  }, [onToggle, onSearchFocus]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
```

**Source:** [MDN: KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)

### Anti-Patterns to Avoid

- **setInterval without timestamp:** Timer will drift in background tabs. Always use timestamp-based calculation.
- **localStorage for timer state:** Per CONTEXT.md, use IndexedDB. localStorage is synchronous and blocks UI.
- **Requesting notification permission on page load:** Must request on first user interaction (Start button click).
- **Playing audio without user interaction first:** AudioContext requires user gesture. Preload on first click.
- **Storing full session in IndexedDB every tick:** Debounce saves to every few seconds.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB raw API | Custom IndexedDB wrapper | `idb` library | Promise-based, handles edge cases, well-tested |
| Audio playback | External MP3 file | Web Audio API OscillatorNode | No file dependency, instant playback |
| Timer accuracy | setInterval tick counting | Timestamp-based calculation | Immune to background throttling |
| Keyboard shortcuts | Individual event handlers | Custom hook with useCallback | Centralized, clean lifecycle management |

**Key insight:** The `idb` library is the standard for IndexedDB in modern React apps. It provides a clean Promise API that matches modern async/await patterns and handles browser quirks.

---

## Common Pitfalls

### Pitfall 1: Timer Drift in Background Tabs

**What goes wrong:** Timer slows or stops when tab is in background.
**Why it happens:** Browsers throttle setInterval to ~1000ms minimum in background, potentially slower.
**How to avoid:** Use timestamp-based calculation. Store `startTime` and calculate `remaining = duration - (Date.now() - startTime)`.
**Warning signs:** Sessions take longer than expected, especially in background.

### Pitfall 2: IndexedDB Data Corruption

**What goes wrong:** App fails to load or crashes due to corrupted IndexedDB data.
**Why it happens:** Schema changes, browser bugs, or storage quota issues.
**How to avoid:** Always validate data on load. If validation fails, clear and reset to defaults. Implement schema versioning.
**Warning signs:** Console errors about IndexedDB failures, app crashes on load.

### Pitfall 3: Audio Autoplay Blocked

**What goes wrong:** No sound plays when timer ends.
**Why it happens:** Browser autoplay policy requires user interaction before playing audio.
**How to avoid:** Initialize AudioContext on first user click (Start button). Handle promise rejection gracefully.
**Warning signs:** Audio works on first session, fails after tab sits idle.

### Pitfall 4: Notification Permission Too Late

**What goes wrong:** Timer ends but no notification appears.
**Why it happens:** Permission requested after timer completes not before,.
**How to avoid:** Request permission on first Start button click, before timer begins.
**Warning signs:** Permission prompt appears at wrong time.

### Pitfall 5: Stale React Closures

**What goes wrong:** Timer state doesn't update correctly, uses old values.
**Why it happens:** Using setInterval in useEffect without functional state updates.
**How to avoid:** Use functional updates: `setTime(prev => prev - 1)` or timestamp-based approach.
**Warning signs:** Timer stuck at initial value, linting warnings.

---

## Code Examples

### Complete Timer Hook (Timestamp-Based)

```typescript
// hooks/useTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  duration: number;           // Total seconds
  remaining: number;          // Seconds remaining
  isRunning: boolean;
  sessionCount: number;       // 1-4, resets after long break
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function useTimer(onComplete?: () => void) {
  const [state, setState] = useState<TimerState>({
    mode: 'focus',
    duration: DURATIONS.focus,
    remaining: DURATIONS.focus,
    isRunning: false,
    sessionCount: 1,
  });

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Calculate remaining time using timestamp
  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const remaining = Math.max(0, state.duration - elapsed);

    if (remaining <= 0) {
      setState(s => ({ ...s, remaining: 0, isRunning: false }));
      onComplete?.();
      return;
    }

    setState(s => ({ ...s, remaining }));
    rafRef.current = requestAnimationFrame(tick);
  }, [state.duration, onComplete]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setState(s => ({ ...s, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Adjust duration to account for elapsed time
    setState(s => ({
      ...s,
      isRunning: false,
      duration: s.remaining, // Save remaining as new duration
    }));
    startTimeRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    const duration = DURATIONS[state.mode];
    setState(s => ({
      ...s,
      isRunning: false,
      duration,
      remaining: duration,
    }));
  }, [state.mode]);

  const setMode = useCallback((mode: TimerMode) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    const duration = DURATIONS[mode];
    setState(s => ({
      ...s,
      mode,
      isRunning: false,
      duration,
      remaining: duration,
    }));
  }, []);

  const skip = useCallback(() => {
    // Move to next session
    let nextMode: TimerMode;
    let nextSessionCount = state.sessionCount;

    if (state.mode === 'focus') {
      // After focus, go to break
      nextSessionCount = state.sessionCount >= 4 ? 1 : state.sessionCount + 1;
      nextMode = state.sessionCount >= 4 ? 'longBreak' : 'shortBreak';
    } else {
      // After break, go to focus
      nextMode = 'focus';
    }

    setMode(nextMode);
    setState(s => ({ ...s, sessionCount: nextSessionCount }));
  }, [state.mode, state.sessionCount, setMode]);

  // Start/stop animation frame based on isRunning
  useEffect(() => {
    if (state.isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.isRunning, tick]);

  return {
    ...state,
    start,
    pause,
    reset,
    setMode,
    skip,
  };
}
```

### IndexedDB Service with Migration Support

```typescript
// services/db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'pomodoro-timer';
const CURRENT_VERSION = 1;

interface PomodoroDB extends DBSchema {
  timerState: {
    key: string;
    value: {
      id: string;
      mode: string;
      duration: number;
      remaining: number;
      startTime: number | null;
      pausedAt: number | null;
      sessionCount: number;
      isRunning: boolean;
      lastSaved: number;
    };
  };
  settings: {
    key: string;
    value: {
      id: string;
      focusDuration: number;
      shortBreakDuration: number;
      longBreakDuration: number;
      autoStart: boolean;
      version: number;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<PomodoroDB>> {
  return openDB<PomodoroDB>(DB_NAME, CURRENT_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Migration stub (DATA-02)
      // Add migration logic here when schema changes
      console.log(`Migrating from version ${oldVersion} to ${newVersion}`);
    },
    blocked() {
      console.warn('Database blocked - please close other tabs');
    },
  });
}

export async function saveTimerState(state: Partial<PomodoroDB['timerState']['value']>): Promise<void> {
  const db = await initDB();
  await db.put('timerState', {
    id: 'current',
    mode: 'focus',
    duration: 25 * 60,
    remaining: 25 * 60,
    startTime: null,
    pausedAt: null,
    sessionCount: 1,
    isRunning: false,
    lastSaved: Date.now(),
    ...state,
  });
}

export async function loadTimerState(): Promise<PomodoroDB['timerState']['value'] | null> {
  try {
    const db = await initDB();
    const state = await db.get('timerState', 'current');

    // Validate data (DATA-01: handle corrupted data)
    if (!state) return null;
    if (typeof state.duration !== 'number' || state.duration < 0) return null;
    if (typeof state.sessionCount !== 'number' || state.sessionCount < 1) return null;

    return state;
  } catch (error) {
    console.error('Failed to load timer state:', error);
    return null;
  }
}

export async function saveSettings(settings: Partial<PomodoroDB['settings']['value']>): Promise<void> {
  const db = await initDB();
  await db.put('settings', {
    id: 'preferences',
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    autoStart: false,
    version: CURRENT_VERSION,
    ...settings,
  });
}

export async function loadSettings(): Promise<PomodoroDB['settings']['value'] | null> {
  try {
    const db = await initDB();
    return await db.get('settings', 'preferences');
  } catch {
    return null;
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage for timer | IndexedDB for timer state | CONTEXT.md decision | More reliable, larger capacity |
| setInterval counting | Timestamp-based calculation | Modern best practice | Accurate in background tabs |
| HTML5 Audio element | Web Audio API OscillatorNode | Current recommendation | No file dependency, instant |
| External notification library | Native Notifications API | Standard in all modern browsers | No dependencies needed |
| Component-level shortcuts | Custom hook (useKeyboardShortcuts) | Standard React pattern | Reusable, testable |

**Deprecated/outdated:**
- setInterval for precise timing - replaced by timestamp calculation
- localStorage for complex/state-heavy apps - replaced by IndexedDB
- HTML5 Audio for simple beeps - replaced by Web Audio API

---

## Open Questions

1. **How to handle very long background periods?**
   - What we know: Timestamp-based calculation handles any length
   - What's unclear: Should we cap maximum session length? What if user leaves for days?
   - Recommendation: Cap at original duration (timer can't run indefinitely in background)

2. **Should we use Web Workers for timer?**
   - What we know: Web Workers run on separate thread, immune to tab throttling
   - What's unclear: Added complexity vs. marginal benefit for typical Pomodoro usage
   - Recommendation: Start with timestamp-based approach; add Web Worker if issues arise

3. **How to handle IndexedDB in private/incognito mode?**
   - What we know: Some browsers don't support IndexedDB in private mode
   - What's unclear: Fallback behavior - should we use memory-only or localStorage?
   - Recommendation: Try IndexedDB first, catch error, fallback to in-memory with warning

---

## Sources

### Primary (HIGH confidence)
- [idb npm package](https://www.npmjs.com/package/idb) - IndexedDB wrapper library
- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) - Browser notifications
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio playback
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) - Tab visibility detection

### Secondary (MEDIUM confidence)
- [STACK.md research](/.planning/research/STACK.md) - Project stack choices
- [PITFALLS.md research](/.planning/research/PITFALLS.md) - Common timer pitfalls
- [ARCHITECTURE.md research](/.planning/research/ARCHITECTURE.md) - React patterns

### Tertiary (LOW confidence)
- Timer accuracy edge cases - may need validation during implementation
- IndexedDB private mode behavior varies by browser - needs testing

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Well-established React/Vite/TypeScript stack
- Architecture: HIGH - Timestamp-based timer is standard best practice
- IndexedDB: HIGH - `idb` library is well-documented and stable
- Notifications: HIGH - Native browser API, well-supported
- Audio: HIGH - Web Audio API is standard
- Keyboard shortcuts: HIGH - Standard event handling

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days for stable web APIs)
