import { TimerState } from '../types/timer'
import {
  initDB,
  isIndexedDBAvailable,
  toStorableState,
  fromStoredState,
  validateTimerState,
  getDefaultState,
} from './db'

const DEBOUNCE_MS = 2000
const DB_KEY = 'current'

let saveTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Save timer state to IndexedDB with debouncing
 * Debounces saves to every 2 seconds while running
 */
export function saveTimerState(state: TimerState): void {
  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Debounce the save
  saveTimeout = setTimeout(async () => {
    try {
      if (!isIndexedDBAvailable()) {
        console.warn('IndexedDB not available, skipping save')
        return
      }

      const db = await initDB()
      const storableState = toStorableState(state)
      await db.put('timerState', storableState)
    } catch (error) {
      console.error('Failed to save timer state:', error)
    }
  }, DEBOUNCE_MS)
}

/**
 * Force an immediate save (used when pausing/stopping)
 */
export function saveTimerStateImmediate(state: TimerState): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }

  saveToDB(state)
}

/**
 * Internal function to save to DB
 */
async function saveToDB(state: TimerState): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, skipping save')
      return
    }

    const db = await initDB()
    const storableState = toStorableState(state)
    await db.put('timerState', storableState)
  } catch (error) {
    console.error('Failed to save timer state:', error)
  }
}

/**
 * Load timer state from IndexedDB
 * Returns default state if no saved state or if data is corrupted
 */
export async function loadTimerState(): Promise<TimerState> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, using default state')
      return getDefaultState()
    }

    const db = await initDB()
    const stored = await db.get('timerState', DB_KEY)

    if (!stored) {
      return getDefaultState()
    }

    // Validate the stored data
    const validated = validateTimerState(stored)
    if (!validated) {
      console.warn('Stored timer state is corrupted, resetting to defaults')
      return getDefaultState()
    }

    // Calculate elapsed time if timer was running
    let state = fromStoredState(validated)

    if (validated.isRunning && validated.startTime) {
      const elapsed = Math.floor((Date.now() - validated.startTime) / 1000)
      const newTimeRemaining = Math.max(0, state.timeRemaining - elapsed)

      // If timer completed while away, mark as complete
      if (newTimeRemaining === 0) {
        state = {
          ...state,
          timeRemaining: 0,
          isRunning: false,
          startTime: null,
        }
      } else {
        // Resume from where it should be
        state = {
          ...state,
          timeRemaining: newTimeRemaining,
          startTime: Date.now(), // Reset start time for accurate ticking
        }
      }
    }

    return state
  } catch (error) {
    console.error('Failed to load timer state:', error)
    return getDefaultState()
  }
}

/**
 * Clear saved timer state
 */
export async function clearTimerState(): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      return
    }

    const db = await initDB()
    await db.delete('timerState', DB_KEY)
  } catch (error) {
    console.error('Failed to clear timer state:', error)
  }
}
