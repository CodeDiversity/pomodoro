import { Middleware, isAction } from '@reduxjs/toolkit'
import { saveSessionState } from '../../services/persistence'
import type { RootState } from '../../app/store'

let saveTimeout: ReturnType<typeof setTimeout> | null = null

const DEBOUNCE_MS = 500

/**
 * Session Persistence Middleware
 *
 * Intercepts session actions and persists state to IndexedDB:
 * - Debounced saves (500ms) for noteText and tags changes
 * - Matches the timing from the original useSessionNotes hook
 */
export const sessionPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Let the action pass through first
  const result = next(action)

  // Only process session actions
  if (!isAction(action) || !action.type.startsWith('session/')) {
    return result
  }

  // Only persist on note/tags changes, not status updates
  const relevantActions = ['session/setNoteText', 'session/setTags', 'session/resetSession']
  if (!relevantActions.includes(action.type)) {
    return result
  }

  const state = store.getState() as RootState
  const sessionState = state.session

  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  // Debounce the save (500ms)
  saveTimeout = setTimeout(async () => {
    try {
      await saveSessionState({
        noteText: sessionState.noteText,
        tags: sessionState.tags,
      })
      store.dispatch({ type: 'session/markSaved' })
    } catch (error) {
      console.error('Failed to persist session state:', error)
    }
  }, DEBOUNCE_MS)

  return result
}
