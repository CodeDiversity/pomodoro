import { format, differenceInDays, parseISO } from 'date-fns'
import { SessionRecord } from '../types/session'

/**
 * Daily activity summary for streak calculation
 */
export interface DailyActivity {
  date: string // YYYY-MM-DD format
  sessionCount: number
  totalSeconds: number
}

/**
 * Streak calculation result
 */
export interface StreakResult {
  currentStreak: number
  bestStreak: number
  lastActiveDate: string | null
  protectionUsed: boolean
}

/**
 * Group completed sessions by day
 * Only counts sessions with actualDurationSeconds >= 300 (5 minutes)
 */
export function groupSessionsByDay(sessions: SessionRecord[]): Map<string, DailyActivity> {
  const dailyMap = new Map<string, DailyActivity>()

  for (const session of sessions) {
    // Only count completed sessions with 5+ minutes
    if (!session.completed || session.actualDurationSeconds < 300) {
      continue
    }

    // Use date-fns format for local timezone handling
    const dateStr = format(new Date(session.startTimestamp), 'yyyy-MM-dd')
    const existing = dailyMap.get(dateStr) || {
      date: dateStr,
      sessionCount: 0,
      totalSeconds: 0,
    }

    dailyMap.set(dateStr, {
      date: dateStr,
      sessionCount: existing.sessionCount + 1,
      totalSeconds: existing.totalSeconds + session.actualDurationSeconds,
    })
  }

  return dailyMap
}

/**
 * Get today's date as YYYY-MM-DD string using local timezone
 */
function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get yesterday's date as YYYY-MM-DD string using local timezone
 */
function getYesterdayString(): string {
  return format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
}

/**
 * Calculate streak from daily activity
 *
 * Algorithm:
 * 1. If no activity today AND no activity yesterday:
 *    - If gap > 1 day and streak >= 5 and protection not used: use protection
 *    - Otherwise: reset streak to 0
 * 2. If activity today AND lastActiveDate != today:
 *    - If lastActiveDate was yesterday: increment streak
 *    - Otherwise: start new streak (1)
 * 3. Always update bestStreak if current > best
 */
export function calculateStreaks(
  dailyActivity: Map<string, DailyActivity>,
  currentStreak: number,
  bestStreak: number,
  lastActiveDate: string | null,
  protectionUsed: boolean
): StreakResult {
  const today = getTodayString()
  const yesterday = getYesterdayString()

  const hasActivityToday = dailyActivity.has(today)
  const hasActivityYesterday = dailyActivity.has(yesterday)

  // Case 1: No recent activity - streak may be broken
  if (!hasActivityToday && !hasActivityYesterday) {
    if (lastActiveDate) {
      const lastDate = parseISO(lastActiveDate)
      const todayDate = parseISO(today)
      const daysSince = differenceInDays(todayDate, lastDate)

      if (daysSince > 1) {
        // More than 1 day gap - streak broken
        if (currentStreak >= 5 && !protectionUsed) {
          // Use protection - keep streak but mark protection as used
          return {
            currentStreak,
            bestStreak,
            lastActiveDate,
            protectionUsed: true,
          }
        } else {
          // Reset streak
          return {
            currentStreak: 0,
            bestStreak,
            lastActiveDate,
            protectionUsed: false,
          }
        }
      }
    }
    // No active streak to worry about, maintain current state
    return { currentStreak, bestStreak, lastActiveDate, protectionUsed }
  }

  // Case 2: Has activity - check if it's a new day
  if (hasActivityToday && lastActiveDate !== today) {
    let newStreak: number

    if (lastActiveDate === yesterday) {
      // Consecutive day - increment streak
      newStreak = currentStreak + 1
    } else if (lastActiveDate === null || lastActiveDate === today) {
      // First activity ever or same day - start new streak at 1
      newStreak = 1
    } else {
      // Gap existed (more than yesterday), start new streak
      newStreak = 1
    }

    const newBest = Math.max(newStreak, bestStreak)

    // Reset protection if starting a fresh streak
    const newProtectionUsed = newStreak === 1 ? false : protectionUsed

    return {
      currentStreak: newStreak,
      bestStreak: newBest,
      lastActiveDate: today,
      protectionUsed: newProtectionUsed,
    }
  }

  // Has activity today but already counted (same day), no change
  return { currentStreak, bestStreak, lastActiveDate, protectionUsed }
}
