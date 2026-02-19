import styled from 'styled-components'

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
`

const Modal = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`

const Title = styled.h2`
  margin: 0 0 1rem;
  color: #27ae60;
  font-size: 1.5rem;
`

const Stat = styled.div`
  margin-bottom: 0.5rem;
  color: #333;
`

const Label = styled.span`
  font-weight: 600;
  color: #666;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const Tag = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e74c3c;
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
`

const NotePreview = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
  max-height: 80px;
  overflow-y: auto;
`

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: #219a52;
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
