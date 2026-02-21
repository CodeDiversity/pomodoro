import styled from 'styled-components'
import { colors, radii, shadows, spacing, transitions } from './ui/theme'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const Modal = styled.div`
  background: ${colors.background};
  padding: ${spacing.xl};
  border-radius: ${radii.lg};
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform ${transitions.normal}, box-shadow ${transitions.normal};
`

const Title = styled.h2`
  margin: 0 0 ${spacing.lg};
  color: ${colors.success};
  font-size: 1.5rem;
  font-weight: 600;
`

const Stat = styled.div`
  margin-bottom: ${spacing.sm};
  color: ${colors.text};
`

const Label = styled.span`
  font-weight: 600;
  color: ${colors.textMuted};
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`

const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${colors.primary};
  color: white;
  border-radius: ${radii.full};
  font-size: 0.8rem;
`

const NotePreview = styled.div`
  margin-top: ${spacing.lg};
  padding: ${spacing.md};
  background: ${colors.surface};
  border-radius: ${radii.sm};
  font-size: 0.9rem;
  color: ${colors.textMuted};
  max-height: 80px;
  overflow-y: auto;
`

const Button = styled.button`
  margin-top: ${spacing.xl};
  padding: ${spacing.md} ${spacing.xl};
  background: ${colors.success};
  color: white;
  border: none;
  border-radius: ${radii.md};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  box-shadow: ${shadows.md};
  transition: all ${transitions.normal};

  &:hover {
    background: ${colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${shadows.lg};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${shadows.sm};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
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
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Overlay onClick={onContinue}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Session Complete!</Title>
        <Stat>
          <Label>Duration:</Label> {session.durationString}
        </Stat>
        <Stat>
          <Label>Started:</Label> {formatTime(session.startTimestamp)}
        </Stat>
        {session.tags.length > 0 && (
          <Stat>
            <Label>Tags:</Label>
            <TagsContainer>
              {session.tags.map((tag, i) => (
                <Tag key={i}>{tag}</Tag>
              ))}
            </TagsContainer>
          </Stat>
        )}
        {session.noteText && (
          <NotePreview>
            {session.noteText.length > 200
              ? session.noteText.substring(0, 200) + '...'
              : session.noteText}
          </NotePreview>
        )}
        <Button onClick={onContinue}>Continue</Button>
      </Modal>
    </Overlay>
  )
}
