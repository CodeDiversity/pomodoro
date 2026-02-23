import { Middleware, isAction } from '@reduxjs/toolkit'
import { isIndexedDBAvailable } from '../../services/db'
import { saveStreak } from '../../services/streakStore'
import type { RootState } from '../../app/store'

const DEBOUNCE_MS = 500
let saveTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Streak Persistence Middleware
 *
 * Intercepts streak actions and persists state to IndexedDB:
 * - Debounced saves (500ms) on streak updates
 */
export const streakPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  // Let the action pass through first
  const result = next(action)

  // Only process streak actions
  if (!isAction(action) || !action.type.startsWith('streak/')) {
    return result
  }

  // Only persist on updateStreak action
  if (action.type !== 'streak/updateStreak') {
    return result
  }

  const state = store.getState() as RootState
  const streakState = state.streak

  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  // Debounce the save (500ms)
  saveTimeout = setTimeout(async () => {
    try {
      if (!isIndexedDBAvailable()) {
        console.warn('IndexedDB not available, skipping streak save')
        return
      }

      await saveStreak({
        currentStreak: streakState.currentStreak,
        bestStreak: streakState.bestStreak,
        lastActiveDate: streakState.lastActiveDate,
        protectionUsed: streakState.protectionUsed,
      })
    } catch (error) {
      console.error('Failed to persist streak state:', error)
    }
  }, DEBOUNCE_MS)

  return result
}
