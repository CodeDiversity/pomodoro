import { TimerState } from '../types/timer'
import {
  initDB,
  isIndexedDBAvailable,
  toStorableState,
  fromStoredState,
  validateTimerState,
  getDefaultState,
} from './db'

export interface AppSettings {
  autoStart: boolean
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
}

const DEFAULT_SETTINGS: AppSettings = {
  autoStart: false,
  focusDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
}

const SETTINGS_KEY = 'current'

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

/**
 * Save app settings to IndexedDB
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, skipping settings save')
      return
    }

    const db = await initDB()
    await db.put('settings', {
      id: SETTINGS_KEY,
      focusDuration: settings.focusDuration,
      shortBreakDuration: settings.shortBreakDuration,
      longBreakDuration: settings.longBreakDuration,
      autoStart: settings.autoStart,
      version: 1,
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

/**
 * Load app settings from IndexedDB
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, using default settings')
      return DEFAULT_SETTINGS
    }

    const db = await initDB()
    const stored = await db.get('settings', SETTINGS_KEY)

    if (!stored) {
      return DEFAULT_SETTINGS
    }

    return {
      autoStart: stored.autoStart ?? DEFAULT_SETTINGS.autoStart,
      focusDuration: stored.focusDuration ?? DEFAULT_SETTINGS.focusDuration,
      shortBreakDuration: stored.shortBreakDuration ?? DEFAULT_SETTINGS.shortBreakDuration,
      longBreakDuration: stored.longBreakDuration ?? DEFAULT_SETTINGS.longBreakDuration,
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

const SESSION_STATE_KEY = 'current'

/**
 * Save session state to IndexedDB
 */
export async function saveSessionState(state: {
  noteText: string
  tags: string[]
  lastSaved?: number
}): Promise<void> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, skipping session save')
      return
    }

    const db = await initDB()
    await db.put('sessionState', {
      id: SESSION_STATE_KEY,
      noteText: state.noteText,
      tags: state.tags,
      lastSaved: state.lastSaved ?? Date.now(),
      version: 1,
    })
  } catch (error) {
    console.error('Failed to save session state:', error)
  }
}

/**
 * Load session state from IndexedDB
 */
export async function loadSessionState(): Promise<{
  noteText: string
  tags: string[]
  lastSaved: number | null
} | null> {
  try {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, using default session state')
      return null
    }

    const db = await initDB()
    const stored = await db.get('sessionState', SESSION_STATE_KEY)

    if (!stored) {
      return null
    }

    return {
      noteText: stored.noteText || '',
      tags: stored.tags || [],
      lastSaved: stored.lastSaved || null,
    }
  } catch (error) {
    console.error('Failed to load session state:', error)
    return null
  }
}
