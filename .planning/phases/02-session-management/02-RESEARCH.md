# Phase 2: Session Management - Research

**Researched:** 2026-02-19
**Domain:** Session recording, note-taking, IndexedDB persistence
**Confidence:** HIGH

## Summary

Phase 2 implements session recording with note capture during Focus sessions. Key technical challenges include: (1) adding IndexedDB store for sessions with complex schema, (2) implementing 500ms debounced autosave for notes, (3) building a tag input component with chip UI and autocomplete, (4) triggering saves on session completion and periodic checkpoints.

**Primary recommendation:** Extend existing `idb` database with new `sessions` store, use native `crypto.randomUUID()` for IDs, implement custom debounce hook for autosave, build tag input from scratch using styled-components.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Note Input UI:** Collapsible panel with toggle button below timer, plain textarea with placeholder "Capture your thoughts...", show save status ("Saving..." then "Saved" with timestamp)
- **Tag Input UX:** Chip/pill interface with enter to create, autocomplete from previously used tags, X button + backspace for removal, "3/10 tags used" counter
- **Session Save Triggers:** Periodic checkpoints every 5 minutes AND at end of session, manual save button available, discard incomplete sessions (reset/skip mid-session), show summary after session ends
- **Session Data Structure:** Full ISO timestamp + milliseconds, include completed status, mode type, start type (manual/auto), store duration as both seconds (number) and MM:SS (string), use timestamp-based UUID

### Claude's Discretion

- Exact periodic checkpoint interval (default 5 minutes)
- Summary modal design and content
- Tag validation regex details
- Session storage format (IndexedDB schema)

### Deferred Ideas (OUT OF SCOPE)

- Editing sessions after recording - Phase 3
- Deleting sessions - Phase 3
- Viewing session history - Phase 3

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTE-01 | Text input available during Focus sessions only | Existing timer mode check, collapsible panel UI |
| NOTE-02 | Notes autosave while timer runs (debounced, 500ms) | Custom debounce hook or lodash, useEffect integration |
| NOTE-03 | Note maximum length: 2000 characters | Native textarea maxLength attribute |
| NOTE-04 | Tags input allows comma-separated tags | Tag input component with split logic |
| NOTE-05 | Maximum 10 tags, each max 20 characters, alphanumeric + dash only | Tag validation with regex: `/^[a-zA-Z0-9-]{1,20}$/` |
| SESS-01 | On Focus session end (timer hits 0 or Skip), save session record | Session save triggered in useTimer completion handler |
| SESS-02 | Session record includes: id (uuid), start timestamp, end timestamp | IndexedDB schema with required fields |
| SESS-03 | Session record includes: planned duration seconds, actual duration seconds | Calculate actual from timestamps |
| SESS-04 | Session record includes: mode (Focus only for history) | Store mode enum value |
| SESS-05 | Session record includes: note text, tags array | Store with session record |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Already in use |
| styled-components | 6.3.10 | Styling | Already in use |
| idb | 8.0.0 | IndexedDB wrapper | Already in use, best-in-class Promise-based API |
| TypeScript | 5.6 | Type safety | Already in use |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| crypto.randomUUID() | Native | UUID generation | Use instead of uuid library - no dependency needed |
| lodash.debounce | (optional) 4.17.21 | Debounce utility | Only if custom hook proves complex |

**Installation:**
```bash
# No new packages needed - all features available natively
# Optional: npm install lodash.debounce (if custom debounce is problematic)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── NotePanel.tsx        # Collapsible note input panel
│   ├── TagInput.tsx         # Chip/pill tag input with autocomplete
│   └── SessionSummary.tsx  # Post-session summary modal
├── hooks/
│   ├── useSessionNotes.ts  # Note state + 500ms debounced autosave
│   └── useSessionManager.ts # Session save/load logic
├── services/
│   ├── sessionStore.ts      # IndexedDB session operations (extend db.ts)
│   └── tagStore.ts          # Tag autocomplete storage
├── types/
│   └── session.ts          # Session data types
└── constants/
    └── session.ts           # Session-related constants
```

### Pattern 1: Debounced Autosave (500ms)

**What:** Autosave notes with 500ms debounce while timer runs
**When to use:** When user types in note textarea during focus session

```typescript
// Custom debounce hook approach (recommended - no dependency)
import { useRef, useCallback } from 'react'

function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  return debouncedCallback
}

// Usage in NotePanel
const debouncedSave = useDebounce((text: string) => {
  saveNoteToSession(sessionId, text)
}, 500)
```

### Pattern 2: Tag Input with Chips

**What:** Input field that creates removable chip elements on Enter
**When to use:** When implementing tag input with autocomplete

```typescript
// Tag validation regex (from decisions)
const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/

// Tag chip interface
interface TagChip {
  id: string        // unique for key
  value: string     // display text
}

// Basic chip creation on Enter
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && inputValue.trim()) {
    e.preventDefault()
    const tag = inputValue.trim()
    if (TAG_REGEX.test(tag) && tags.length < 10 && !tags.includes(tag)) {
      setTags([...tags, tag])
      setInputValue('')
    }
  }
  // Backspace to remove last tag
  if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
    setTags(tags.slice(0, -1))
  }
}
```

### Pattern 3: IndexedDB Session Store

**What:** Extend existing db.ts with sessions object store
**When to use:** Storing session records with all required fields

```typescript
// Extend PomodoroDBSchema in db.ts
interface PomodoroDBSchema extends DBSchema {
  // ... existing stores
  sessions: {
    key: string          // session UUID
    value: SessionRecord
    indexes: { 'by-date': number }  // index for sorting
  }
  tags: {
    key: string         // tag value
    value: TagData
  }
}

interface SessionRecord {
  id: string                    // UUID
  startTimestamp: string        // ISO with milliseconds
  endTimestamp: string          // ISO with milliseconds
  plannedDurationSeconds: number
  actualDurationSeconds: number
  durationString: string        // "MM:SS"
  mode: 'focus'                // Only focus for history
  startType: 'manual' | 'auto'
  completed: boolean
  noteText: string
  tags: string[]
  createdAt: number            // timestamp for indexing
}

// Save session on completion
async function saveSession(record: SessionRecord): Promise<void> {
  const db = await initDB()
  await db.put('sessions', record)
}
```

### Pattern 4: Session Save Triggers

**What:** Save sessions at periodic checkpoints and on session end
**When to use:** When implementing session recording

```typescript
// In useTimer - detect session completion
useEffect(() => {
  if (!isInitializedRef.current) return

  const wasRunning = previousTimeRef.current > 0
  const isNowComplete = state.timeRemaining === 0

  if (wasRunning && isNowComplete && state.mode === 'focus') {
    // Save complete session
    saveSession(createSessionRecord({
      ...sessionData,
      completed: true,
      endTimestamp: new Date().toISOString(),
    }))
    // Show summary modal
    setShowSummary(true)
  }

  previousTimeRef.current = state.timeRemaining
}, [state.timeRemaining, state.mode])

// Periodic checkpoint (every 5 minutes)
useEffect(() => {
  if (!state.isRunning || state.mode !== 'focus') return

  const interval = setInterval(() => {
    // Save checkpoint
    saveCheckpoint(sessionData)
  }, 5 * 60 * 1000) // 5 minutes

  return () => clearInterval(interval)
}, [state.isRunning, state.mode])
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom ID function | `crypto.randomUUID()` | Native browser API, cryptographically secure, no dependency |
| IndexedDB operations | Raw IndexedDB API | `idb` library | Already in use, Promise-based, better error handling |
| Debounce | Complex custom implementation | Simple custom hook or lodash.debounce | Well-understood pattern, either approach works |
| Date formatting | Custom formatter | Native `Intl.DateTimeFormat` or simple helper | Sufficient for MM:SS format |

**Key insight:** The existing `idb` library is already excellent for IndexedDB. The main work is extending the schema and implementing the UI components.

## Common Pitfalls

### Pitfall 1: Debounce Reset on Every Keystroke
**What goes wrong:** Debounce timer resets on each keystroke, causing 500ms delay after LAST keystroke, not first
**Why it happens:** Not clearing previous timeout before setting new one
**How to avoid:** Always clearTimeout before setTimeout in debounce implementation
**Warning signs:** Notes not saving, apparent lag in autosave indicator

### Pitfall 2: Saving Incomplete Sessions
**What goes wrong:** Sessions saved when user resets or skips mid-session
**Why it happens:** Not checking if session actually completed (timer hit 0)
**How to avoid:** Only save on SESS-01 triggers (timer hits 0 OR explicit session end), discard on reset/skip during active session
**Warning signs:** Many partial sessions in history

### Pitfall 3: Tag Autocomplete Shows Already-Used Tags
**What goes wrong:** Autocomplete suggests tags already added to current session
**Why it happens:** Not filtering out current session's tags from suggestions
**How to avoid:** Filter autocomplete list: `allTags.filter(t => !currentTags.includes(t))`
**Warning signs:** Duplicate tags being created

### Pitfall 4: Notes Lost on Page Refresh During Session
**What goes wrong:** Notes typed before checkpoint interval are lost if page refreshes
**Why it happens:** Notes only saved at checkpoints (5 min) or session end
**How to avoid:** Also save on blur (textarea loses focus) and at shorter intervals (every 30s during typing)
**Warning signs:** Users report losing notes after refresh

### Pitfall 5: Session Start Time Not Captured at START
**What goes wrong:** Using current time at session END as start time
**Why it happens:** Not storing startTimestamp when session begins
**How to avoid:** Capture `startTimestamp = new Date().toISOString()` in START action, preserve through pauses
**Warning signs:** Incorrect duration calculations, sessions showing wrong length

## Code Examples

### Example 1: Complete Session Record Creation
```typescript
// Source: Based on existing db.ts patterns and requirements
function createSessionRecord(params: {
  startTime: number          // Date.now() when started
  plannedDuration: number   // seconds (e.g., 1500)
  actualDuration: number    // seconds actually elapsed
  mode: TimerMode
  startType: 'manual' | 'auto'
  completed: boolean
  noteText: string
  tags: string[]
}): SessionRecord {
  const startTimestamp = new Date(params.startTime).toISOString()
  const endTimestamp = new Date().toISOString()

  const formatDuration = (secs: number): string => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  return {
    id: crypto.randomUUID(),
    startTimestamp,
    endTimestamp,
    plannedDurationSeconds: params.plannedDuration,
    actualDurationSeconds: params.actualDuration,
    durationString: formatDuration(params.actualDuration),
    mode: params.mode,
    startType: params.startType,
    completed: params.completed,
    noteText: params.noteText,
    tags: params.tags,
    createdAt: Date.now(),
  }
}
```

### Example 2: NotePanel Component (Simplified)
```typescript
// Source: Based on styled-components patterns from existing components
import styled from 'styled-components'

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
`

const SaveStatus = styled.span<{ $saving: boolean }>`
  color: ${props => props.$saving ? '#e67e22' : '#27ae60'};
  font-size: 0.875rem;
`

interface NotePanelProps {
  isVisible: boolean
  noteText: string
  onNoteChange: (text: string) => void
  saveStatus: 'idle' | 'saving' | 'saved'
}

export default function NotePanel({ isVisible, noteText, onNoteChange, saveStatus }: NotePanelProps) {
  return (
    <Panel $isVisible={isVisible}>
      <TextArea
        value={noteText}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Capture your thoughts..."
        maxLength={2000}
      />
      <div>
        <SaveStatus $saving={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' :
           saveStatus === 'saved' ? 'Saved' : ''}
        </SaveStatus>
        <span>{noteText.length}/2000</span>
      </div>
    </Panel>
  )
}
```

### Example 3: Tag Input Component (Simplified)
```typescript
// Source: Based on chip input patterns
const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/
const MAX_TAGS = 10

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  suggestions: string[]  // from previous sessions
}

export default function TagInput({ tags, onTagsChange, suggestions }: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (TAG_REGEX.test(tag) && tags.length < MAX_TAGS && !tags.includes(tag)) {
      onTagsChange([...tags, tag])
      setInput('')
    }
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const filteredSuggestions = suggestions
    .filter(s => !tags.includes(s))
    .filter(s => s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 5)

  return (
    <div>
      <div>
        {tags.map((tag, i) => (
          <span key={i}>
            {tag}
            <button onClick={() => removeTag(i)}>x</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={tags.length >= MAX_TAGS}
        placeholder={tags.length >= MAX_TAGS ? 'Max tags reached' : 'Add tag...'}
      />
      {input && filteredSuggestions.length > 0 && (
        <ul>
          {filteredSuggestions.map(s => (
            <li key={s} onClick={() => addTag(s)}>{s}</li>
          ))}
        </ul>
      )}
      <span>{tags.length}/10 tags used</span>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage | IndexedDB via idb | Phase 1 | Enables complex queries, better performance, larger storage |
| Manual timestamp calculation | Date.now() timestamp-based | Phase 1 | Accurate timer that survives background/tab switch |
| Custom ID generation | crypto.randomUUID() | Now | Simpler, cryptographically secure, no library needed |
| lodash debounce | Custom hook or lodash | Discretion | Either works; custom hook has zero dependencies |

**Deprecated/outdated:**
- None relevant to this phase

## Open Questions

1. **Summary Modal Design**
   - What we know: Show after session ends, before continuing
   - What's unclear: Exact fields to display, layout, whether it's a modal vs inline
   - Recommendation: Simple centered modal with session stats, note preview, tags display, and "Continue" button

2. **Tag Autocomplete Storage**
   - What we know: Need to store previously used tags for autocomplete
   - What's unclear: Where to store (IndexedDB vs in-memory), how many to keep
   - Recommendation: Store in IndexedDB `tags` store, keep last 50 unique tags, sorted by frequency

3. **Checkpoint Interval Flexibility**
   - What we know: Default is 5 minutes per decisions
   - What's unclear: Whether this should be configurable or hardcoded
   - Recommendation: Hardcode for v1, store as constant, easy to make configurable later

## Sources

### Primary (HIGH confidence)
- Existing codebase: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/services/db.ts` - idb usage patterns
- Existing codebase: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/services/persistence.ts` - debounce patterns
- Existing codebase: `/Users/michaelrobert/Documents/GitHub/pomodoro/src/hooks/useTimer.ts` - timer state management
- MDN Web Docs: `crypto.randomUUID()` - native browser API

### Secondary (MEDIUM confidence)
- styled-components documentation - existing usage patterns in codebase

### Tertiary (LOW confidence)
- React debounce patterns - common well-understood approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all technologies already in use
- Architecture: HIGH - follows existing patterns in codebase
- Pitfalls: MEDIUM - based on general web development experience, no framework-specific issues found

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days for stable technology)
