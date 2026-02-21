import { useState } from 'react'
import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { HistoryFilterBar } from './HistoryFilterBar'
import { HistoryItem } from './HistoryItem'
import { colors, radii, shadows, spacing, transitions } from '../ui/theme'

const ListContainer = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
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
  display: block;
  width: 100%;
  padding: ${spacing.md};
  margin-top: ${spacing.lg};
  border: 1px solid ${colors.primary};
  border-radius: ${radii.md};
  background: ${colors.background};
  color: ${colors.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${shadows.sm};
  transition: all ${transitions.normal};

  &:hover {
    background: ${colors.primary};
    color: #fff;
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${shadows.sm};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    border-color: ${colors.border};
    color: ${colors.textMuted};
    cursor: not-allowed;
    box-shadow: none;
    &:hover {
      background: ${colors.background};
      color: ${colors.textMuted};
      transform: none;
      box-shadow: none;
    }
  }
`

const SessionCount = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 12px;
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
}

export function HistoryList({
  filteredSessions,
  dateFilter,
  searchQuery,
  isLoading,
  onDateFilterChange,
  onSearchChange,
  onSessionClick,
}: HistoryListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const visibleSessions = filteredSessions.slice(0, visibleCount)
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
    <ListContainer>
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
          <SessionCount>
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
          </SessionCount>
          {visibleSessions.map((session) => (
            <HistoryItem
              key={session.id}
              session={session}
              onClick={() => onSessionClick(session)}
            />
          ))}
          {hasMore && (
            <LoadMoreButton onClick={handleLoadMore}>
              Load more
            </LoadMoreButton>
          )}
        </>
      )}
    </ListContainer>
  )
}
