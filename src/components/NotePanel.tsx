import styled from 'styled-components'
import { colors, radii, transitions, spacing } from './ui/theme'

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: ${spacing.md};
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  background: ${colors.background};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color ${transitions.fast}, box-shadow ${transitions.fast};
  background-color: ${colors.background};

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
  }
`

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${spacing.sm};
  font-size: 0.8rem;
  color: ${colors.textMuted};
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
