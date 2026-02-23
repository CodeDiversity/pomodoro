import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { formatDurationFull, truncateText } from '../../utils/durationUtils'
import { colors } from '../ui/theme'

const ItemContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

const StatusIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const CheckmarkIcon = styled.svg`
  width: 20px;
  height: 20px;
  color: #27AE60;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #1A1A1A;
  margin-bottom: 4px;
`

const TimeRange = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
`

const NotePreview = styled.div`
  font-size: 0.85rem;
  color: #888;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
`

const DurationBadge = styled.span`
  background: #F5F5F5;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
`

const Tag = styled.span`
  background: #F0F7FF;
  color: #0066FF;
  border: 1px solid #0066FF;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.75rem;
`

interface HistoryItemProps {
  session: SessionRecord
  onClick: () => void
}

function formatTimeRange(startTimestamp: string, durationSeconds: number): string {
  const start = new Date(startTimestamp)
  const end = new Date(start.getTime() + durationSeconds * 1000)

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return `${formatTime(start)} - ${formatTime(end)}`
}

function extractSessionTitle(session: SessionRecord): string {
  // First priority: taskTitle from session input
  if (session.taskTitle) {
    return truncateText(session.taskTitle, 50)
  }
  // Second priority: first line of noteText
  if (session.noteText) {
    const firstLine = session.noteText.split('\n')[0].trim()
    if (firstLine) {
      return truncateText(firstLine, 50)
    }
  }
  // Default fallback
  return 'Focus Session'
}

export function HistoryItem({ session, onClick }: HistoryItemProps) {
  const title = extractSessionTitle(session)
  const timeRange = formatTimeRange(session.startTimestamp, session.actualDurationSeconds)
  const duration = formatDurationFull(session.actualDurationSeconds)

  // Get notes preview (excluding the title line if it was from notes)
  let notesPreview = ''
  if (session.noteText) {
    const lines = session.noteText.split('\n')
    if (lines.length > 1) {
      notesPreview = lines.slice(1).join(' ').trim()
    }
  }

  return (
    <ItemContainer onClick={onClick}>
      <StatusIcon>
        <CheckmarkIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </CheckmarkIcon>
      </StatusIcon>

      <Content>
        <Title>{title}</Title>
        <TimeRange>{timeRange}</TimeRange>
        {notesPreview && (
          <NotePreview>{truncateText(notesPreview, 100)}</NotePreview>
        )}
      </Content>

      <Meta>
        <DurationBadge>{duration}</DurationBadge>
        {session.tags.length > 0 && (
          <TagsContainer>
            {session.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {session.tags.length > 3 && (
              <Tag>+{session.tags.length - 3}</Tag>
            )}
          </TagsContainer>
        )}
      </Meta>
    </ItemContainer>
  )
}
