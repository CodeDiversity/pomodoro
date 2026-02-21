import { useState } from 'react'
import styled from 'styled-components'
import { colors, transitions, spacing } from './ui/theme'

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  background: white;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  padding: 24px;
  gap: 16px;
  flex: 1;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const HeaderTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.text};
`

const HeaderSubtitle = styled.div`
  font-size: 0.85rem;
  color: ${colors.textMuted};
`

const TaskInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const TaskInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colors.textMuted};
`

const TaskInputIcon = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textMuted};
  pointer-events: none;
`

const TaskInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color ${transitions.fast}, box-shadow ${transitions.fast};

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }
`

const SessionNotesLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
`

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #F0F0F0;
`

const ToolbarButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color ${transitions.fast};

  &:hover {
    background-color: #F5F5F5;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`

const TextAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const TextArea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  box-sizing: border-box;
  transition: border-color ${transitions.fast};

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #0066FF;
  }
`

const StatusRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${spacing.md};
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

// Task Icon
const TaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)

// Toolbar Icons
const BoldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

export default function NotePanel({
  isVisible,
  noteText,
  onNoteChange,
  saveStatus,
  lastSaved,
  maxLength,
}: NotePanelProps) {
  const [taskInput, setTaskInput] = useState('')

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Panel $isVisible={isVisible}>
      <Header>
        <HeaderTitle>Active Session</HeaderTitle>
        <HeaderSubtitle>Configure your current focus task</HeaderSubtitle>
      </Header>

      <TaskInputContainer>
        <Label>What are you working on?</Label>
        <TaskInputWrapper>
          <TaskInputIcon>
            <TaskIcon />
          </TaskInputIcon>
          <TaskInput
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="What are you working on?"
          />
        </TaskInputWrapper>
      </TaskInputContainer>

      <SessionNotesLabel>SESSION NOTES</SessionNotesLabel>
      <Toolbar>
        <ToolbarButton aria-label="Bold" title="Bold">
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="List" title="List">
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Link" title="Link">
          <LinkIcon />
        </ToolbarButton>
      </Toolbar>

      <TextAreaContainer>
        <TextArea
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Brainstorming key UI components..."
          maxLength={maxLength}
        />
      </TextAreaContainer>

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
