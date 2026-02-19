import { useState, useCallback, useRef, useEffect } from 'react'

const MAX_NOTE_LENGTH = 2000

export function useSessionNotes(onSave: (note: string, tags: string[]) => void) {
  const [noteText, setNoteText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<number | null>(null)

  // Ref to track the debounce timeout
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup function to clear pending saves on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const debouncedSave = useCallback((text: string, currentTags: string[]) => {
    setSaveStatus('saving')

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for 500ms debounce
    debounceTimeoutRef.current = setTimeout(() => {
      onSave(text, currentTags)
      setSaveStatus('saved')
      setLastSaved(Date.now())
    }, 500)
  }, [onSave])

  const handleNoteChange = useCallback((text: string) => {
    if (text.length <= MAX_NOTE_LENGTH) {
      setNoteText(text)
      setSaveStatus('saving')
      debouncedSave(text, tags)
    }
  }, [tags, debouncedSave])

  const handleTagsChange = useCallback((newTags: string[]) => {
    setTags(newTags)
    setSaveStatus('saving')
    debouncedSave(noteText, newTags)
  }, [noteText, debouncedSave])

  const resetNotes = useCallback(() => {
    setNoteText('')
    setTags([])
    setSaveStatus('idle')
    setLastSaved(null)
  }, [])

  return {
    noteText,
    tags,
    saveStatus,
    lastSaved,
    maxNoteLength: MAX_NOTE_LENGTH,
    handleNoteChange,
    handleTagsChange,
    resetNotes,
  }
}
