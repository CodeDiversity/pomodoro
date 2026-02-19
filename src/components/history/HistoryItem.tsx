import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { formatDateFull } from '../../utils/dateUtils'
import { formatDurationFull, truncateText } from '../../utils/durationUtils'

const ItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;

  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
`

const LeftContent = styled.div`
  flex: 1;
  min-width: 0;
`

const DateDurationRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
`

const Duration = styled.span`
  color: #666;
`

const NotePreview = styled.div`
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: 12px;
  flex-shrink: 0;
`

const Tag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: #e8e8e8;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #555;
`

interface HistoryItemProps {
  session: SessionRecord
  onClick: () => void
}

export function HistoryItem({ session, onClick }: HistoryItemProps) {
  return (
    <ItemContainer onClick={onClick}>
      <LeftContent>
        <DateDurationRow>
          <span>{formatDateFull(session.startTimestamp)}</span>
          <Duration>{formatDurationFull(session.actualDurationSeconds)}</Duration>
        </DateDurationRow>
        {session.noteText && (
          <NotePreview>{truncateText(session.noteText, 80)}</NotePreview>
        )}
      </LeftContent>
      {session.tags.length > 0 && (
        <TagsContainer>
          {session.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}
    </ItemContainer>
  )
}
