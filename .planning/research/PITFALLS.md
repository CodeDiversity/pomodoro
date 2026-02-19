# Pitfalls Research

**Domain:** Pomodoro Timer Web App
**Researched:** 2026-02-19
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Timer Drift and Background Tab Throttling

**What goes wrong:**
The timer stops or slows significantly when the browser tab is in the background. Browsers throttle `setInterval` and `setTimeout` to conserve battery, causing the Pomodoro timer to lose accuracy. A 25-minute focus session might take 30+ minutes in a background tab.

**Why it happens:**
Modern browsers implement aggressive power-saving measures. When a tab is inactive, they reduce timer precision from milliseconds to ~1000ms minimum, and may further throttle based on CPU load. This is a deliberate browser optimization, not a bug.

**How to avoid:**
1. Use Web Workers for timer logic (runs on separate thread, unaffected by tab throttling)
2. Store a target end timestamp in localStorage, calculate remaining time on tab focus
3. Use the Page Visibility API (`document.hidden`) to detect when tab becomes active and recalculate

```typescript
// RECOMMENDED: Use timestamps, not tick counting
const startTime = Date.now();
const duration = 25 * 60 * 1000;

function getRemainingTime() {
  const elapsed = Date.now() - startTime;
  return Math.max(0, duration - elapsed);
}
```

**Warning signs:**
- Timer shows different times on different devices
- Users report "timer is slow" or "sessions take too long"
- Tests pass locally but fail in CI (headless browsers)

**Phase to address:**
Foundation Phase (Core Timer Implementation)

---

### Pitfall 2: React Stale Closures with useEffect Timers

**What goes wrong:**
The timer displays stale state values, or the timer stops updating after the first tick. The callback captures the initial state value and never sees updates.

**Why it happens:**
Using `setInterval` in `useEffect` with an empty dependency array `[]` while referencing state inside the callback. The closure captures the state from the first render and never updates.

```typescript
// BROKEN - stale closure
useEffect(() => {
  const interval = setInterval(() => {
    setTime(time - 1); // Always uses time from first render!
  }, 1000);
  return () => clearInterval(interval);
}, []); // Bug: 'time' is used but not in deps
```

**How to avoid:**
1. Use functional state updates: `setTime(prev => prev - 1)`
2. Use a custom `useInterval` hook that handles cleanup properly
3. Consider using a ref for mutable values that don't need re-renders

```typescript
// CORRECT - functional update
useEffect(() => {
  const interval = setInterval(() => {
    setTime(prev => prev - 1); // Always gets current value
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**Warning signs:**
- Timer stuck at initial value
- Linting warnings about missing dependencies
- Component re-renders but timer doesn't update

**Phase to address:**
Foundation Phase (Core Timer Implementation)

---

### Pitfall 3: Losing Timer State on Page Refresh

**What goes wrong:**
When users refresh the page mid-session, they lose their progress. The timer resets to 25:00, and the session is lost.

**Why it happens:**
No state persistence mechanism. Timer state exists only in React memory, which is cleared on refresh.

**How to avoid:**
1. Persist timer state to localStorage on every tick (debounced)
2. Store: `startTime`, `duration`, `sessionType`, `isPaused`, `pausedAt` (if applicable)
3. On app load, check for persisted state and resume if a session was in progress

```typescript
// Persist state
localStorage.setItem('timerState', JSON.stringify({
  startTime: Date.now(),
  duration: 25 * 60,
  sessionType: 'focus',
  isPaused: false
}));

// Restore on load
const saved = JSON.parse(localStorage.getItem('timerState'));
if (saved && Date.now() < saved.startTime + saved.duration * 1000) {
  // Resume session
}
```

**Warning signs:**
- Users complain about losing progress on refresh
- No "restore session" behavior after browser crash
- History shows incomplete sessions without explanation

**Phase to address:**
Foundation Phase (Core Timer Implementation)

---

### Pitfall 4: Audio Notification Fails to Play

**What goes wrong:**
When the timer completes, no sound plays. Users miss the notification and don't know the session ended.

**Why it happens:**
Browser autoplay policies block audio that hasn't been triggered by user interaction. If the user hasn't clicked anything since page load, audio.play() fails with a NotAllowedError.

**How to avoid:**
1. Require user interaction before playing any audio (e.g., a "Start" button that also preloads audio)
2. Use the AudioContext API which requires user gesture anyway
3. Handle the promise rejection and show a visual fallback

```typescript
// Must be triggered by user click first
const playAlarm = async () => {
  try {
    await alarmAudio.play();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showVisualNotification(); // Fallback
    }
  }
};

// Preload on first user interaction
document.addEventListener('click', () => {
  alarmAudio.load(); // Prepare for future play()
}, { once: true });
```

**Warning signs:**
- Audio works in development but fails in production
- Works on first session but fails after idle time
- Different behavior across browsers

**Phase to address:**
Foundation Phase (Notifications & Alerts)

---

### Pitfall 5: localStorage Data Corruption and Quota Limits

**What goes wrong:**
The app crashes or throws errors when accessing history. Old sessions disappear, or the app fails to save new sessions.

**Why it happens:**
- localStorage has a 5-10MB limit per origin
- Storage can be corrupted by malformed JSON
- Private/incognito mode clears data when tab closes
- Third-party extensions can clear or restrict storage

**How to avoid:**
1. Wrap all localStorage access in try-catch
2. Implement data validation before reading
3. Set a maximum session history limit (e.g., 1000 sessions)
4. Implement data migration for schema changes

```typescript
// Safe localStorage access
function getHistory(): Session[] {
  try {
    const data = localStorage.getItem('sessions');
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return []; // Validate structure
    return parsed.slice(-1000); // Limit size
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
}
```

**Warning signs:**
- Console errors about quota exceeded
- App breaks after extended use
- History appears empty or corrupted

**Phase to address:**
Foundation Phase (Data Persistence)

---

### Pitfall 6: Browser Notifications Denied or Unavailable

**What goes wrong:**
Users don't receive desktop notifications when the timer ends, especially on mobile or in browsers with strict privacy settings.

**Why it happens:**
- Notifications require HTTPS in production
- Users must explicitly grant permission (prompted by user gesture)
- Permission can be denied or revoked
- Safari has limited notification support
- Private browsing often blocks notifications

**How to avoid:**
1. Always provide in-app visual notifications as primary method
2. Request permission early but with clear explanation
3. Handle permission denial gracefully
4. Don't rely solely on notifications - include audio and visual cues

```typescript
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
```

**Warning signs:**
- Permission prompt appears too late (after timer ends)
- No fallback when notifications fail
- Different behavior across browsers

**Phase to address:**
Foundation Phase (Notifications & Alerts)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `setInterval` without Web Worker | Simpler code | Timer drift in background tabs | MVP only, must fix before launch |
| Storing full session objects in localStorage | Easy to implement | Storage quota issues | With strict size limits |
| Skipping error handling for localStorage | Faster initial dev | App crashes on storage errors | Never acceptable |
| Using `Date.now()` without timezone handling | Works locally | Time display issues for international users | MVP only |
| No data migration strategy | Fast initial release | Breaking changes when schema updates | Never acceptable |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Storing too much history | Slow app startup, storage quota | Implement pagination, limit to 1000 sessions | After ~500 sessions |
| Too many re-renders | Timer display flickers, poor performance | Use refs for frequently updating values | Always |
| Large localStorage writes on every tick | UI jank, storage lag | Debounce writes (every 1-5 seconds) | Always |
| Uncompressed history data | Storage quota hit faster | Compress old sessions, keep recent JSON | After 200+ sessions |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing sensitive notes in plain localStorage | Data exposure via XSS | Don't store sensitive data, warn users |
| No input sanitization for session notes | XSS via stored notes | Sanitize user input before rendering |
| Executing user notes as code | Critical: Code execution | Never use eval(), innerHTML with user data |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No way to pause mid-session | Users lose progress when interrupted | Implement pause functionality |
| Timer continues in background without indication | Users think timer stopped | Show visual indicator, use Page Visibility API |
| No confirmation before resetting | Accidental reset loses session | Add confirmation dialog |
| Sessions don't auto-start next phase | Disrupts workflow | Offer auto-start option for breaks |
| No visual feedback during breaks | Hard to know break status | Distinct UI for focus vs break |

---

## "Looks Done But Isn't" Checklist

- [ ] **Timer:** Works in foreground but drifts in background tabs - verify with multiple tabs open
- [ ] **Notifications:** Permission requested but no fallback when denied - test with notifications blocked
- [ ] **Audio:** Plays in Chrome but fails in Safari - test across browsers
- [ ] **History:** Loads 10 sessions but slows with 1000 - test pagination
- [ ] **Refresh:** Timer state lost on refresh - verify with hard refresh mid-session
- [ ] **Private mode:** App crashes in incognito - test in private window
- [ ] **Long break:** Long break never triggers after 4 sessions - verify Pomodoro cycle logic
- [ ] **Timezone:** Session times appear wrong for international users - use UTC internally

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Timer drift | LOW | Recalculate from stored timestamp on tab focus |
| Lost session on refresh | LOW | Restore from localStorage on mount |
| Corrupted localStorage | MEDIUM | Clear and reinitialize with empty state |
| Audio autoplay blocked | LOW | Show visual notification as primary, audio as enhancement |
| History quota exceeded | MEDIUM | Implement cleanup of old sessions, migrate to compressed format |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Timer drift | Foundation - Core Timer | Test with background tab for 5+ minutes |
| Stale closures | Foundation - Core Timer | Lint rules, manual testing |
| State refresh loss | Foundation - Core Timer | Refresh mid-session, verify restoration |
| Audio autoplay | Foundation - Notifications | Test after idle period |
| localStorage corruption | Foundation - Data Persistence | Test with quota exceeded |
| Notifications unavailable | Foundation - Notifications | Test with permissions denied |
| History performance | Features - History | Load 1000+ sessions |
| Pomodoro cycle logic | Features - Timer Logic | Complete 4 focus sessions |

---

## Sources

- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval) - Timer accuracy and throttling
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Storage limitations
- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) - Notification requirements
- [MDN: Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide) - Audio restrictions
- [Overreacted: A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useEffect/) - React timer patterns
- [GitHub Topics: Pomodoro Timer](https://github.com/topics/pomodoro-timer) - Platform challenges

---

*Pitfalls research for: Pomodoro Timer Web App*
*Researched: 2026-02-19*
