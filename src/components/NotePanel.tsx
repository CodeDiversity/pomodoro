import styled from 'styled-components'
import { colors, transitions, spacing } from './ui/theme'

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: ${spacing.md};
  padding: ${spacing.lg};
  border: none;
  border-radius: 16px;
  background: #fefefe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform ${transitions.normal}, box-shadow ${transitions.normal};

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
  padding-bottom: ${spacing.sm};
  border-bottom: 1px solid #f0f0f0;
`

const HeaderIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${colors.textMuted};
`

const HeaderLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${spacing.sm};
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  box-sizing: border-box;
  transition: background-color ${transitions.fast}, box-shadow ${transitions.fast};
  background-color: transparent;

  &::placeholder {
    color: #999;
    font-style: italic;
    font-weight: 400;
  }

  &:focus {
    outline: none;
    background-color: rgba(231, 76, 60, 0.03);
    box-shadow: inset 0 0 0 2px rgba(231, 76, 60, 0.15);
  }
`

const StatusRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
  font-size: 0.75rem;
  color: ${colors.textMuted};
`

const SaveStatus = styled.span<{ $saving: boolean }>`
  color: ${props => props.$saving ? '#e67e22' : '#27ae60'};
  transition: color ${transitions.fast};
`

const CharCounter = styled.span`
  color: ${colors.textMuted};
  font-variant-numeric: tabular-nums;
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
      <Header>
        <HeaderIcon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </HeaderIcon>
        <HeaderLabel>Notes</HeaderLabel>
      </Header>
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
        <CharCounter>{noteText.length}/{maxLength}</CharCounter>
      </StatusRow>
    </Panel>
  )
}
