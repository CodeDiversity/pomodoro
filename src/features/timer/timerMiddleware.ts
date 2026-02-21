import { Middleware, isAction } from '@reduxjs/toolkit'
import { saveTimerState, saveTimerStateImmediate } from '../../services/persistence'
import type { RootState } from '../../app/store'

let saveTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Timer Persistence Middleware
 *
 * Intercepts timer actions and persists state to IndexedDB:
 * - Debounced saves (2000ms) while timer is running
 * - Immediate saves when timer is paused or stopped
 */
export const timerPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Let the action pass through first
  const result = next(action)

  // Only process timer actions
  if (!isAction(action) || !action.type.startsWith('timer/')) {
    return result
  }

  const state = store.getState() as RootState
  const timerState = state.timer

  // Clear any pending debounced save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  // Save immediately when paused or stopped, debounced while running
  if (timerState.isRunning) {
    // Debounce saves while running (2000ms)
    saveTimeout = setTimeout(() => {
      saveTimerState(timerState)
    }, 2000)
  } else {
    // Save immediately when paused or stopped
    saveTimerStateImmediate(timerState)
  }

  return result
}
