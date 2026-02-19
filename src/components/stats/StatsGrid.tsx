import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { DateFilter } from '../../utils/dateUtils'
import { Stats } from '../../utils/statsUtils'
import { formatDuration } from '../../utils/statsUtils'
import { getAllSessions } from '../../services/sessionStore'
import { SessionRecord } from '../../types/session'
import { useFilteredStats } from '../../hooks/useFilteredStats'
import { StatCard } from './StatCard'

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

interface StatsGridProps {
  dateFilter: DateFilter
}

/**
 * 2x2 grid of stat cards showing productivity metrics
 * Cards: Today (total time), Last 7 Days (total time), Sessions Today, Longest Session
 */
export function StatsGrid({ dateFilter }: StatsGridProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      try {
        const allSessions = await getAllSessions()
        // Only focus sessions
        const focusSessions = allSessions.filter(s => s.mode === 'focus')
        setSessions(focusSessions)
      } catch (error) {
        console.error('Failed to load sessions:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [])

  const { stats, longestSessionInRange } = useFilteredStats(sessions, dateFilter)

  if (loading) {
    return (
      <GridContainer>
        <StatCard label="Today" value="—" />
        <StatCard label="Last 7 Days" value="—" />
        <StatCard label="Sessions Today" value="—" />
        <StatCard label="Longest Session" value="—" />
      </GridContainer>
    )
  }

  return (
    <GridContainer>
      <StatCard
        label="Today"
        value={formatDuration(stats.totalFocusTimeToday)}
      />
      <StatCard
        label="Last 7 Days"
        value={formatDuration(stats.totalFocusTimeLast7Days)}
      />
      <StatCard
        label="Sessions Today"
        value={stats.sessionsToday.toString()}
        subtext={stats.sessionsToday === 1 ? '1 session' : `${stats.sessionsToday} sessions`}
      />
      <StatCard
        label="Longest Session"
        value={formatDuration(longestSessionInRange)}
      />
    </GridContainer>
  )
}
