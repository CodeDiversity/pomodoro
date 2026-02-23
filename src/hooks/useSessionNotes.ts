import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setNoteText, setTags, setTaskTitle, resetSession, loadSession } from '../features/session/sessionSlice'
import { loadSessionState } from '../services/persistence'

const MAX_NOTE_LENGTH = 2000

export function useSessionNotes(onSave?: (note: string, tags: string[]) => void) {
  const dispatch = useAppDispatch()
  const { noteText, tags, taskTitle, saveStatus, lastSaved } = useAppSelector(state => state.session)

  // Load session state from IndexedDB on mount
  useEffect(() => {
    loadSessionState().then((savedState) => {
      if (savedState) {
        dispatch(loadSession({
          noteText: savedState.noteText,
          tags: savedState.tags,
          taskTitle: savedState.taskTitle,
          saveStatus: 'idle',
          lastSaved: savedState.lastSaved,
        }))
      }
    })
  }, [dispatch])

  const handleNoteChange = useCallback((text: string) => {
    if (text.length <= MAX_NOTE_LENGTH) {
      dispatch(setNoteText(text))
      onSave?.(text, tags)
    }
  }, [dispatch, tags, onSave])

  const handleTagsChange = useCallback((newTags: string[]) => {
    dispatch(setTags(newTags))
    onSave?.(noteText, newTags)
  }, [dispatch, noteText, onSave])

  const handleTaskTitleChange = useCallback((title: string) => {
    dispatch(setTaskTitle(title))
  }, [dispatch])

  const resetNotes = useCallback(() => {
    dispatch(resetSession())
  }, [dispatch])

  return {
    noteText,
    tags,
    taskTitle,
    saveStatus,
    lastSaved,
    maxNoteLength: MAX_NOTE_LENGTH,
    handleNoteChange,
    handleTagsChange,
    handleTaskTitleChange,
    resetNotes,
  }
}
