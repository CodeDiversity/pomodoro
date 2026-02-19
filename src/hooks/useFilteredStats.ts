import { useMemo } from 'react'
import { SessionRecord } from '../types/session'
import { DateFilter } from '../utils/dateUtils'
import { calculateStats, Stats } from '../utils/statsUtils'

export interface UseFilteredStatsResult {
  stats: Stats
  longestSessionInRange: number
}

/**
 * Hook to calculate stats based on filtered sessions
 */
export function useFilteredStats(
  sessions: SessionRecord[],
  dateFilter: DateFilter
): UseFilteredStatsResult {
  const filteredSessions = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    ).getTime()

    switch (dateFilter) {
      case 'today':
        return sessions.filter(s => s.createdAt >= todayStart)

      case '7days': {
        const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000
        return sessions.filter(s => s.createdAt >= weekAgo)
      }

      case '30days': {
        const monthAgo = todayStart - 30 * 24 * 60 * 60 * 1000
        return sessions.filter(s => s.createdAt >= monthAgo)
      }

      case 'all':
      default:
        return sessions
    }
  }, [sessions, dateFilter])

  const stats = useMemo(
    () => calculateStats(filteredSessions),
    [filteredSessions]
  )

  const longestSessionInRange = useMemo(() => {
    if (filteredSessions.length === 0) return 0
    return Math.max(...filteredSessions.map(s => s.actualDurationSeconds))
  }, [filteredSessions])

  return {
    stats,
    longestSessionInRange,
  }
}
