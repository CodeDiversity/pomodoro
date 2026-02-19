import { useState, useRef } from 'react'
import styled from 'styled-components'

const TAG_REGEX = /^[a-zA-Z0-9-]{1,20}$/
const MAX_TAGS = 10

const Container = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'block' : 'none'};
  margin-top: 0.75rem;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e74c3c;
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #e74c3c;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`

const SuggestionsList = styled.ul`
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  width: calc(100% - 2rem);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
`

const SuggestionItem = styled.li`
  padding: 0.5rem;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`

const Counter = styled.span`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
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
