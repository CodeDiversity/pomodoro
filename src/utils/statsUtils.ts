import { SessionRecord } from '../types/session'

export interface Stats {
  totalFocusTimeToday: number
  totalFocusTimeLast7Days: number
  sessionsToday: number
  longestSession: number
}

/**
 * Returns the start of today (midnight) as a Date
 */
export function getTodayStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

/**
 * Returns the date 7 days ago at midnight as a Date
 */
export function getWeekAgo(): Date {
  const now = new Date()
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0)
  return weekAgo
}

/**
 * Returns the date 30 days ago at midnight as a Date
 */
export function getMonthAgo(): Date {
  const now = new Date()
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0)
  return monthAgo
}

/**
 * Calculate productivity stats from session records
 */
export function calculateStats(sessions: SessionRecord[]): Stats {
  const todayStart = getTodayStart()
  const weekAgo = getWeekAgo()
  const monthAgo = getMonthAgo()

  const todaySessions = sessions.filter(s => s.createdAt >= todayStart.getTime())
  const last7DaysSessions = sessions.filter(s => s.createdAt >= weekAgo.getTime())
  const last30DaysSessions = sessions.filter(s => s.createdAt >= monthAgo.getTime())

  // Total focus time today (in seconds)
  const totalFocusTimeToday = todaySessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0)

  // Total focus time last 7 days (in seconds)
  const totalFocusTimeLast7Days = last7DaysSessions.reduce((sum, s) => sum + s.actualDurationSeconds, 0)

  // Sessions today
  const sessionsToday = todaySessions.length

  // Longest session in last 30 days (the range)
  const longestSession = last30DaysSessions.reduce(
    (max, s) => Math.max(max, s.actualDurationSeconds),
    0
  )

  return {
    totalFocusTimeToday,
    totalFocusTimeLast7Days,
    sessionsToday,
    longestSession,
  }
}

/**
 * Format seconds into a human-readable duration string
 * Examples: "2h 15m", "25m", "5m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return `${minutes}m`
}
