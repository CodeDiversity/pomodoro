import styled from 'styled-components'

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #e74c3c;
  }
`

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
`

const SaveStatus = styled.span<{ $saving: boolean }>`
  color: ${props => props.$saving ? '#e67e22' : '#27ae60'};
`

interface NotePanelProps {
  isVisible: boolean
  noteText: string
  onNoteChange: (text: string) => void
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSaved: number | null
  maxLength: number
}

export default function NotePanel({
  isVisible,
  noteText,
  onNoteChange,
  saveStatus,
  lastSaved,
  maxLength,
}: NotePanelProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Panel $isVisible={isVisible}>
      <TextArea
        value={noteText}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Capture your thoughts..."
        maxLength={maxLength}
      />
      <StatusRow>
        <SaveStatus $saving={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' :
           saveStatus === 'saved' && lastSaved ? `Saved at ${formatTime(lastSaved)}` : ''}
        </SaveStatus>
        <span>{noteText.length}/{maxLength}</span>
      </StatusRow>
    </Panel>
  )
}
