import { useState, useMemo } from 'react'
import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { HistoryFilterBar } from './HistoryFilterBar'
import { HistoryItem } from './HistoryItem'
import { colors, radii, shadows, spacing, transitions } from '../ui/theme'

const ListContainer = styled.div`
  padding: 24px;
  width: 100%;
`

const HeaderSection = styled.div`
  margin-bottom: 24px;
`

const WeeklyStats = styled.div`
  font-size: 1.25rem;
  color: #1A1A1A;
  line-height: 1.5;

  .hours {
    color: ${colors.primary};
    font-weight: 700;
    font-size: 1.5rem;
  }
`

const DateGroupHeader = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 24px 0 12px 0;
  padding-left: 4px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;
`

const EmptyTitle = styled.h3`
  margin: 0 0 12px;
  color: #333;
  font-size: 1.1rem;
`

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.95rem;
`

const LoadingText = styled.div`
  text-align: center;
  padding: 24px;
  color: #666;
`

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 24px;
  background: transparent;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    background: #F5F5F5;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    border-color: ${colors.border};
    color: ${colors.textMuted};
    cursor: not-allowed;
  }
`

const ChevronDownIcon = styled.svg`
  width: 16px;
  height: 16px;
`

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${colors.primary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.4);
  transition: all ${transitions.fast};
  z-index: 100;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 102, 255, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 4px;
  }
`

const PlayIcon = styled.svg`
  width: 24px;
  height: 24px;
  color: white;
  margin-left: 2px;
`

const PAGE_SIZE = 20

interface HistoryListProps {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  dateFilter: 'today' | '7days' | '30days' | 'all'
  searchQuery: string
  isLoading: boolean
  onDateFilterChange: (filter: 'today' | '7days' | '30days' | 'all') => void
  onSearchChange: (query: string) => void
  onSessionClick: (session: SessionRecord) => void
  onStartTimer?: () => void
}

interface GroupedSessions {
  [key: string]: SessionRecord[]
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date, yesterday)
}

function isThisWeek(date: Date): boolean {
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return date >= weekAgo && date <= now
}

function formatDateHeader(date: Date): string {
  const now = new Date()

  if (isSameDay(date, now)) {
    return 'Today'
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isThisWeek(date)) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}

function groupSessionsByDate(sessions: SessionRecord[]): GroupedSessions {
  const groups: GroupedSessions = {}

  sessions.forEach((session) => {
    const date = new Date(session.startTimestamp)
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(session)
  })

  return groups
}

function calculateWeeklyFocusHours(sessions: SessionRecord[]): number {
  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const totalSeconds = sessions
    .filter((session) => {
      const sessionDate = new Date(session.startTimestamp)
      return sessionDate >= weekAgo && sessionDate <= now
    })
    .reduce((sum, session) => sum + session.actualDurationSeconds, 0)

  return Math.round((totalSeconds / 3600) * 10) / 10
}

export function HistoryList({
  sessions,
  filteredSessions,
  dateFilter,
  searchQuery,
  isLoading,
  onDateFilterChange,
  onSearchChange,
  onSessionClick,
  onStartTimer,
}: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const weeklyHours = useMemo(() => calculateWeeklyFocusHours(sessions), [sessions])

  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(filteredSessions)
  }, [filteredSessions])

  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedSessions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [groupedSessions])

  const visibleSessions = useMemo(() => {
    let count = 0
    const result: { dateKey: string; sessions: SessionRecord[] }[] = []

    for (const dateKey of sortedDateKeys) {
      const dateSessions = groupedSessions[dateKey]
      const remaining = visibleCount - count

      if (remaining <= 0) break

      result.push({
        dateKey,
        sessions: dateSessions.slice(0, remaining),
      })
      count += Math.min(dateSessions.length, remaining)
    }

    return result
  }, [groupedSessions, sortedDateKeys, visibleCount])

  const hasMore = visibleCount < filteredSessions.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  if (isLoading) {
    return (
      <ListContainer>
        <LoadingText>Loading...</LoadingText>
      </ListContainer>
    )
  }

  return (
    <>
      <ListContainer>
        <HeaderSection>
          <WeeklyStats>
            You've focused for <span className="hours">{weeklyHours} hours</span> this week
          </WeeklyStats>
        </HeaderSection>

        <HistoryFilterBar
          dateFilter={dateFilter}
          searchQuery={searchQuery}
          onDateFilterChange={onDateFilterChange}
          onSearchChange={onSearchChange}
        />

        {filteredSessions.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No sessions yet</EmptyTitle>
            <EmptyText>Start your first focus session!</EmptyText>
          </EmptyState>
        ) : (
          <>
            {visibleSessions.map(({ dateKey, sessions: dateSessions }) => {
              const date = new Date(dateKey)
              return (
                <div key={dateKey}>
                  <DateGroupHeader>{formatDateHeader(date)}</DateGroupHeader>
                  {dateSessions.map((session) => (
                    <HistoryItem
                      key={session.id}
                      session={session}
                      onClick={() => onSessionClick(session)}
                    />
                  ))}
                </div>
              )
            })}
            {hasMore && (
              <LoadMoreButton onClick={handleLoadMore}>
                <ChevronDownIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </ChevronDownIcon>
                Load Older Sessions
              </LoadMoreButton>
            )}
          </>
        )}
      </ListContainer>

      <FloatingActionButton
        onClick={onStartTimer}
        aria-label="Start new session"
        title="Start new session"
      >
        <PlayIcon viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5 3 19 12 5 21 5 3" />
        </PlayIcon>
      </FloatingActionButton>
    </>
  )
}
