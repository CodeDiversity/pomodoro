import styled from 'styled-components'
import { SessionRecord } from '../../types/session'
import { formatDateFull } from '../../utils/dateUtils'
import { formatDurationFull, truncateText } from '../../utils/durationUtils'
import { colors, radii, shadows, spacing, transitions } from '../ui/theme'

const ItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${radii.lg};
  margin-bottom: ${spacing.sm};
  cursor: pointer;
  transition: all ${transitions.normal};
  background: ${colors.background};
  box-shadow: ${shadows.sm};

  &:hover {
    border-color: ${colors.primary};
    background: ${colors.surface};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

const LeftContent = styled.div`
  flex: 1;
  min-width: 0;
`

const DateDurationRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  font-size: 0.9rem;
  color: ${colors.text};
  margin-bottom: ${spacing.xs};
`

const Duration = styled.span`
  color: ${colors.textMuted};
`

const NotePreview = styled.div`
  font-size: 0.85rem;
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-left: ${spacing.md};
  flex-shrink: 0;
`

const Tag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background: ${colors.surface};
  border-radius: ${radii.full};
  font-size: 0.75rem;
  color: ${colors.textMuted};
  border: 1px solid ${colors.border};
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
