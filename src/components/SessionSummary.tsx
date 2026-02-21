import styled from 'styled-components'
import { colors, radii, shadows, spacing, transitions } from './ui/theme'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 90%;
  padding: 32px;
  text-align: center;
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`

const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;

  svg {
    width: 32px;
    height: 32px;
    color: #27AE60;
  }
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 8px 0;
`

const Duration = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 24px 0;
`

const DetailsCard = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
`

const DetailSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const DetailLabel = styled.span`
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
`

const DetailValue = styled.div`
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`

const Tag = styled.span`
  padding: 4px 12px;
  background: ${colors.primary};
  color: white;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
`

const Timestamp = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
`

const ContinueButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${transitions.normal};

  &:hover {
    background: ${colors.primaryHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px white, 0 0 0 4px ${colors.primary};
  }
`

interface SessionSummaryProps {
  isVisible: boolean
  session: {
    durationString: string
    noteText: string
    tags: string[]
    startTimestamp: string
  } | null
  onContinue: () => void
}

export default function SessionSummary({
  isVisible,
  session,
  onContinue,
}: SessionSummaryProps) {
  if (!isVisible || !session) return null

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Extract title from first line of note
  const getTitle = () => {
    if (!session.noteText) return 'Untitled Session'
    const firstLine = session.noteText.split('\n')[0].trim()
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
  }

  return (
    <Overlay onClick={onContinue}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <SuccessIcon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </SuccessIcon>

        <Title>Session Complete!</Title>
        <Duration>You focused for {session.durationString}</Duration>

        <DetailsCard>
          <DetailSection>
            <DetailLabel>Task</DetailLabel>
            <DetailValue>{getTitle()}</DetailValue>
          </DetailSection>

          {session.tags.length > 0 && (
            <DetailSection>
              <DetailLabel>Tags</DetailLabel>
              <TagsContainer>
                {session.tags.map((tag, i) => (
                  <Tag key={i}>{tag}</Tag>
                ))}
              </TagsContainer>
            </DetailSection>
          )}

          <DetailSection>
            <DetailLabel>Completed</DetailLabel>
            <Timestamp>{formatTime(session.startTimestamp)}</Timestamp>
          </DetailSection>
        </DetailsCard>

        <ContinueButton onClick={onContinue}>Continue</ContinueButton>
      </Modal>
    </Overlay>
  )
}
