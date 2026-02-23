# Feature Research: Streak Counter & CSV Export/Import

**Domain:** Pomodoro productivity app (v2.2 features)
**Researched:** 2026-02-23
**Confidence:** MEDIUM (based on common productivity app patterns; web search unavailable)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Streak Counter

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Current streak display | Core motivation metric | LOW | Days in a row with at least one completed focus session |
| Longest streak display | Achievement/progress tracking | LOW | All-time best, persists in settings store |
| Streak reset indicator | Transparency | LOW | Show why streak broke (e.g., "Last session: 2 days ago") |
| Calendar heatmap | Visual progress, gamification | MEDIUM | GitHub-style contribution grid or monthly calendar |

#### CSV Export/Import

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Export all sessions as CSV | Data ownership/backup | LOW | Download complete history |
| Import CSV with validation | Restore from backup | MEDIUM | Parse, validate, insert valid rows |
| Error reporting on import | Usability | MEDIUM | Show which rows failed and why |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

#### Streak Counter

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Streak milestones | Gamification, motivation | LOW | Celebrate 7-day, 30-day, 100-day streaks with visual feedback |
| Daily goal setting | Motivation | MEDIUM | "Complete 4 sessions today" with progress indicator |
| Weekly streak summary | Weekly context | LOW | Show week-at-a-glance alongside current streak |

#### CSV Export/Import

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Export filtered date range | Usefulness | MEDIUM | Export only today/7 days/30 days to match history filters |
| Merge on import | Multi-device/backup | MEDIUM | Combine imported data with existing without duplicates |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Streak freeze/purchase | Forgiveness for missing days | Business model complexity, not aligned with free app | Keep streaks simple and free |
| Cloud sync export | Automatic backup | Backend required, security concerns | Manual CSV export is explicit and controllable |
| Import from other apps | Format compatibility | Too many variations to handle | Focus on clean export first |
| Drag-drop import zone | Modern UX | Over-engineered for simple CSV | Simple file input is sufficient |

---

## Feature Dependencies

```
Streak Features
├── Session data (EXISTS - SessionRecord in IndexedDB)
├── Date grouping logic (NEW - group sessions by calendar day)
├── Streak calculation (NEW - consecutive day algorithm)
├── Calendar heatmap (NEW - visualization component)
└── Settings storage for longest streak (NEW - extend settings store)

CSV Export/Import
├── Session data (EXISTS - SessionRecord)
├── CSV generation (NEW - convert SessionRecord to CSV format)
├── File download (NEW - Blob URL + anchor click)
├── CSV parsing (NEW - parse CSV string to SessionRecord)
├── Import validation (NEW - validate required fields, dates)
└── Duplicate detection (NEW - check id/createdAt before insert)
```

### Dependency Notes

- **Streak calculation requires date grouping:** Must group sessions by calendar day (not 24-hour periods) using the `createdAt` timestamp
- **CSV import requires validation:** Multiple fields need validation (UUID format, ISO timestamps, numeric durations)
- **Export is simpler than import:** Export is a one-way conversion; import must handle errors gracefully

---

## MVP Definition

### Launch With (v2.2)

Minimum viable product - what's needed to validate the concept.

- [ ] Current streak display - Simple counter showing consecutive days with completed focus sessions
- [ ] Longest streak storage - Persisted in settings store, displayed alongside current streak
- [ ] Export all sessions as CSV - Single button exports complete history with all fields
- [ ] Import CSV with basic validation - Parse file, validate structure, insert valid rows

### Add After Validation (v2.2.x)

Features to add once core is working.

- [ ] Calendar heatmap - Visual grid showing activity intensity per day
- [ ] Export filtered date range - Align with existing history filters
- [ ] Import error reporting - Show detailed errors for invalid rows

### Future Consideration (v2.3+)

Features to defer until product-market fit is established.

- [ ] Streak milestones with celebration UI
- [ ] Daily session goal tracking
- [ ] Merge-on-import to avoid duplicates

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Current streak display | HIGH | LOW | P1 |
| Longest streak storage | HIGH | LOW | P1 |
| Export all sessions CSV | HIGH | LOW | P1 |
| Import CSV with validation | HIGH | MEDIUM | P1 |
| Calendar heatmap | MEDIUM | MEDIUM | P2 |
| Export filtered range | MEDIUM | LOW | P2 |
| Import error reporting | MEDIUM | MEDIUM | P2 |
| Streak milestones | LOW | LOW | P3 |
| Daily goal tracking | LOW | MEDIUM | P3 |
| Merge on import | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for v2.2 launch
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration

---

## Implementation Notes

### Streak Calculation Algorithm

```typescript
interface StreakData {
  current: number      // consecutive days including today/yesterday
  longest: number     // all-time best
  lastSessionDate: string | null  // ISO date string for display
}

function calculateStreak(sessions: SessionRecord[]): StreakData {
  // 1. Group sessions by calendar day (YYYY-MM-DD)
  const sessionDays = new Set(
    sessions
      .filter(s => s.completed && s.mode === 'focus')
      .map(s => new Date(s.createdAt).toISOString().split('T')[0])
  )

  // 2. Sort days descending
  const sortedDays = Array.from(sessionDays).sort((a, b) => b.localeCompare(a))

  // 3. Calculate current streak
  // Allow 1 day gap (yesterday counts even if today not done)
  let current = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (sortedDays.includes(today)) {
    current = 1
    // Count backwards
    for (let i = 1; i < sortedDays.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (sortedDays.includes(expected)) current++
      else break
    }
  } else if (sortedDays.includes(yesterday)) {
    current = 1
  }

  // 4. Track longest (iterate all sorted days, count consecutive)
  // ... similar logic

  return { current, longest, lastSessionDate: sortedDays[0] || null }
}
```

### CSV Format

```csv
id,startTimestamp,endTimestamp,plannedDurationSeconds,actualDurationSeconds,mode,startType,completed,noteText,tags,taskTitle,createdAt
abc123,2026-02-23T10:00:00.000Z,2026-02-23T10:25:00.000Z,1500,1500,focus,manual,true,"Working on project","tag1|tag2","My Task",1708684800000
```

**Format decisions:**
- Tags joined with pipe `|` delimiter (avoids CSV quoting issues)
- ISO 8601 timestamps for universal date compatibility
- createdAt as Unix timestamp for easy sorting/parsing

---

## Sources

- Common productivity app patterns (Duolingo streaks, GitHub contributions, Habitica)
- Standard CSV export patterns (Blob + URL.createObjectURL for downloads)
- IndexedDB session structure verified from `/src/services/db.ts`
- SessionRecord type verified from `/src/types/session.ts`

---

*Feature research for: Pomodoro Timer v2.2 (streak counter, CSV export/import)*
*Researched: 2026-02-23*
