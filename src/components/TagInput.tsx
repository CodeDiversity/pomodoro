import { useState, useRef } from 'react'
import styled from 'styled-components'
import { colors, radii, shadows, transitions, spacing } from './ui/theme'

const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/
const MAX_TAGS = 10

const Container = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: ${spacing.sm};
`

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0066FF;
  background: #F0F7FF;
  border: 1px solid #0066FF;
  border-radius: 16px;
  transition: background-color ${transitions.fast};

  &:hover {
    background: #E0EFFF;
  }
`

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin-left: 6px;
  font-size: 12px;
  line-height: 1;
  color: #0066FF;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color ${transitions.fast};

  &:hover {
    background: rgba(0, 102, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: border-color ${transitions.fast}, box-shadow ${transitions.fast};
  background-color: white;
  color: ${colors.text};

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }

  &:disabled {
    background: #F5F5F5;
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
  margin: 4px 0 0 0;
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

const InputContainer = styled.div`
  position: relative;
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
          <Pill key={i}>
            {tag}
            <RemoveButton onClick={() => removeTag(i)} aria-label={`Remove ${tag} tag`}>×</RemoveButton>
          </Pill>
        ))}
      </TagsContainer>
      <InputContainer>
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
          placeholder={tags.length >= MAX_TAGS ? 'Max tags reached' : '+ Add Tag'}
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
      </InputContainer>
      <Counter>{tags.length}/10 tags used</Counter>
    </Container>
  )
}
