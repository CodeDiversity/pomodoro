import { useState, useRef } from 'react'
import styled from 'styled-components'
import { colors, radii, shadows, transitions, spacing } from './ui/theme'

const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/
const MAX_TAGS = 10

const Container = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: ${spacing.sm};
  padding-top: ${spacing.sm};
  border-top: 1px solid #f0f0f0;
  position: relative;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.sm};
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: ${colors.text};
  background: #f0f0f0;
  border-radius: 4px;
  transition: background-color ${transitions.fast}, transform ${transitions.fast};

  &:hover {
    background: #e8e8e8;
    transform: translateY(-1px);
  }
`

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 2px;
  font-size: 12px;
  line-height: 1;
  color: ${colors.textMuted};
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color ${transitions.fast}, color ${transitions.fast};

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: ${colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: background-color ${transitions.fast}, box-shadow ${transitions.fast};
  background-color: transparent;
  color: ${colors.text};

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    background-color: rgba(231, 76, 60, 0.05);
    box-shadow: inset 0 0 0 1px rgba(231, 76, 60, 0.2);
  }

  &:disabled {
    background: transparent;
    cursor: not-allowed;
  }
`

const SuggestionsList = styled.ul`
  position: absolute;
  background: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  box-shadow: ${shadows.md};
  list-style: none;
  padding: 0;
  margin: 0;
  width: calc(100% - 2rem);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`

const SuggestionItem = styled.li`
  padding: ${spacing.sm} ${spacing.md};
  cursor: pointer;
  transition: background-color ${transitions.fast};

  &:hover {
    background: ${colors.surface};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: -2px;
    background: ${colors.surface};
  }
`

const Counter = styled.span`
  font-size: 0.8rem;
  color: ${colors.textMuted};
  margin-top: ${spacing.xs};
  display: block;
`

interface TagInputProps {
  isVisible: boolean
  tags: string[]
  suggestions: string[]
  onTagsChange: (tags: string[]) => void
}

export default function TagInput({
  isVisible,
  tags,
  suggestions,
  onTagsChange,
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions
    .filter(s => !tags.includes(s))
    .filter(s => s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 5)

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase()
    if (TAG_REGEX.test(tag) && tags.length < MAX_TAGS && !tags.includes(tag)) {
      onTagsChange([...tags, tag])
      setInput('')
      setShowSuggestions(false)
    }
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input) addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <Container $isVisible={isVisible}>
      <TagsContainer>
        {tags.map((tag, i) => (
          <Chip key={i}>
            {tag}
            <RemoveButton onClick={() => removeTag(i)}>x</RemoveButton>
          </Chip>
        ))}
      </TagsContainer>
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setShowSuggestions(true)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        disabled={tags.length >= MAX_TAGS}
        placeholder={tags.length >= MAX_TAGS ? 'Max tags reached' : 'Add tag (press Enter)...'}
      />
      {input && showSuggestions && filteredSuggestions.length > 0 && (
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
      <Counter>{tags.length}/10 tags used</Counter>
    </Container>
  )
}
