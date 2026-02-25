import { useState, useRef } from 'react'
import styled from 'styled-components'
import { colors, transitions } from './ui/theme'
import RichTextEditor from './RichTextEditor'

const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/
const MAX_TAGS = 10

const Panel = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  background: white;
  height: 100%;
`

const PanelHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
`

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${colors.text};
  margin: 0 0 4px 0;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
`

const PanelContent = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SectionLabel = styled.label`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
`

const TaskInputContainer = styled.div`
  position: relative;
`

const TaskInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  background: #f8fafc;
  transition: border-color ${transitions.fast}, box-shadow ${transitions.fast};

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #136dec;
    box-shadow: 0 0 0 3px rgba(19, 109, 236, 0.1);
  }
`

const InputIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NotesContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
`

const CharacterCount = styled.div<{ $isOverLimit: boolean }>`
  font-size: 0.75rem;
  color: ${({ $isOverLimit }) => $isOverLimit ? '#ef4444' : '#64748b'};
  text-align: right;
  padding: 4px 8px 0 0;
  margin-top: 4px;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #136dec;
  background: rgba(19, 109, 236, 0.1);
  border-radius: 9999px;
`

const TagRemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  font-size: 10px;
  color: #136dec;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`

const AddTagButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: 1px dashed #cbd5e1;
  border-radius: 9999px;
  cursor: pointer;
  transition: all ${transitions.fast};

  &:hover {
    border-color: #136dec;
    color: #136dec;
  }
`

const TagInput = styled.input`
  width: 80px;
  padding: 4px 8px;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;

  &:focus {
    outline: none;
    border-color: #136dec;
  }
`

const SuggestionsList = styled.ul`
  position: absolute;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
  max-height: 120px;
  overflow-y: auto;
  z-index: 10;
  min-width: 100px;
`

const SuggestionItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color ${transitions.fast};

  &:hover {
    background: #f1f5f9;
  }
`

const ProTipCard = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: rgba(19, 109, 236, 0.05);
  border: 1px solid rgba(19, 109, 236, 0.1);
`

const ProTipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`

const ProTipTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 700;
  color: #136dec;
  margin: 0;
`

const ProTipText = styled.p`
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`

const CompleteButton = styled.button`
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 16px;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity ${transitions.fast};

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`

interface NotePanelProps {
  isVisible: boolean
  taskTitle: string
  onTaskTitleChange: (title: string) => void
  noteText: string
  onNoteChange: (text: string) => void
  tags: string[]
  suggestions: string[]
  onTagsChange: (tags: string[]) => void
  onCompleteSession: () => void
  maxNoteLength: number
}

// Icons
const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#136dec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M12 2v1"/>
    <path d="M12 7a5 5 0 0 1 5 5c0 2-1 3-2 4l-1 2H9l-1-2c-1-1-2-2-2-4a5 5 0 0 1 5-5z"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export default function NotePanel({
  isVisible,
  taskTitle,
  onTaskTitleChange,
  noteText,
  onNoteChange,
  tags,
  suggestions,
  onTagsChange,
  onCompleteSession,
  maxNoteLength,
}: NotePanelProps) {
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions
    .filter(s => !tags.includes(s))
    .filter(s => s.toLowerCase().includes(tagInput.toLowerCase()))
    .slice(0, 5)

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (TAG_REGEX.test(tag) && tags.length < MAX_TAGS && !tags.includes(tag)) {
      onTagsChange([...tags, tag])
      setTagInput('')
      setShowTagInput(false)
      setShowSuggestions(false)
    }
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInput) addTag(tagInput)
    }
    if (e.key === 'Escape') {
      setShowTagInput(false)
      setTagInput('')
    }
  }

  const handleAddTagClick = () => {
    setShowTagInput(true)
    setTimeout(() => tagInputRef.current?.focus(), 0)
  }

  return (
    <Panel $isVisible={isVisible}>
      <PanelHeader>
        <Title>Active Session</Title>
        <Subtitle>Configure your current focus task</Subtitle>
      </PanelHeader>

      <PanelContent>
        <Section>
          <SectionLabel>Current Task</SectionLabel>
          <TaskInputContainer>
            <InputIcon><EditIcon /></InputIcon>
            <TaskInput
              type="text"
              value={taskTitle}
              onChange={(e) => onTaskTitleChange(e.target.value)}
              placeholder="What are you working on?"
            />
          </TaskInputContainer>
        </Section>

        <Section>
          <SectionLabel>Session Notes</SectionLabel>
          <NotesContainer>
            <RichTextEditor content={noteText} onChange={onNoteChange} />
          </NotesContainer>
          <CharacterCount $isOverLimit={noteText.length > maxNoteLength}>
            {noteText.length} / {maxNoteLength}
            {noteText.length > maxNoteLength && ' (limit reached)'}
          </CharacterCount>
        </Section>

        <Section>
          <SectionLabel>Tags</SectionLabel>
          <TagsContainer>
            {tags.map((tag, i) => (
              <Tag key={i}>
                #{tag} <TagRemoveButton onClick={() => removeTag(i)} aria-label={`Remove ${tag} tag`}><CloseIcon /></TagRemoveButton>
              </Tag>
            ))}
            {showTagInput ? (
              <div style={{ position: 'relative' }}>
                <TagInput
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => setTimeout(() => {
                    setShowTagInput(false)
                    setShowSuggestions(false)
                    setTagInput('')
                  }, 200)}
                  placeholder="tag"
                />
                {tagInput && showSuggestions && filteredSuggestions.length > 0 && (
                  <SuggestionsList>
                    {filteredSuggestions.map(s => (
                      <SuggestionItem
                        key={s}
                        onClick={() => addTag(s)}
                      >
                        {s}
                      </SuggestionItem>
                    ))}
                  </SuggestionsList>
                )}
              </div>
            ) : (
              tags.length < MAX_TAGS && (
                <AddTagButton onClick={handleAddTagClick}>
                  <AddIcon /> Add Tag
                </AddTagButton>
              )
            )}
          </TagsContainer>
        </Section>

        <ProTipCard>
          <ProTipHeader>
            <LightbulbIcon />
            <ProTipTitle>Pro Tip</ProTipTitle>
          </ProTipHeader>
          <ProTipText>Try the 'Pomodoro Technique' - 25 mins work, 5 mins break for maximum focus.</ProTipText>
        </ProTipCard>
      </PanelContent>

      <CompleteButton onClick={onCompleteSession}>
        <CheckCircleIcon />
        Complete Session
      </CompleteButton>
    </Panel>
  )
}
