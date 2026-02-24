---
quick: 13
title: Fix session duration calculation for partial sessions
tags: [bug-fix, session, timer]

# Summary

Fixed bug where session duration showed remaining time instead of elapsed time when user ends session early.

# Problem

When user clicked Reset/Skip after 10 seconds:
- Expected: 10 seconds (actual elapsed time)
- Actual: 24:50 (remaining time = 25 min - 10 sec)

# Root Cause

In `useSessionManager.ts`, the formula was:
```javascript
const actualDuration = params.duration - elapsedTime
```

This calculates **remaining time** instead of **elapsed time**.

# Fix

Changed to:
```javascript
const actualDuration = completed ? params.duration : elapsedTime
```

Now:
- If session completed naturally → use full duration
- If session ended early → use actual elapsed time

# Files Changed

- `src/hooks/useSessionManager.ts` - Fixed duration calculation

# Verification

- Build passes
- Manual test: Start timer, wait ~10 seconds, click Reset. Check History - should show ~0:10 duration, not 24:50

---

*Completed: 2026-02-24*
