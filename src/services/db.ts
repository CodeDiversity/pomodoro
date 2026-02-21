import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { TimerState, TimerMode } from '../types/timer'
import { SessionRecord, TagData } from '../types/session'
import { DEFAULT_STATE } from '../constants/timer'

const DB_NAME = 'pomodoro-timer'
const DB_VERSION = 2
const STORE_NAME = 'timerState'
const STATE_KEY = 'current'
const SCHEMA_VERSION = 1

interface PomodoroDBSchema extends DBSchema {
  timerState: {
    key: string
    value: TimerStateData
  }
  settings: {
    key: string
    value: SettingsData
  }
  sessions: {
    key: string                    // session UUID
    value: SessionRecord
    indexes: { 'by-date': number } // index for sorting by createdAt
  }
  tags: {
    key: string                    // tag value
    value: TagData
  }
}

interface TimerStateData {
  id: string
  mode: TimerMode
  duration: number
  timeRemaining: number
  isRunning: boolean
  sessionCount: number
  startTime: number | null
  pausedTimeRemaining: number | null
  lastTick: number | null
  autoStart: boolean
  version: number
}

interface SettingsData {
  id: string
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  autoStart: boolean
  version: number
}

let dbInstance: IDBPDatabase<PomodoroDBSchema> | null = null

/**
 * Initialize the IndexedDB database
 * Creates the 'timerState' and 'settings' object stores
 */
export async function initDB(): Promise<IDBPDatabase<PomodoroDBSchema>> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB<PomodoroDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Create timerState store (v1)
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }

        // Create settings store (v1)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }

        // Create sessions store (v2)
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' })
            sessionsStore.createIndex('by-date', 'createdAt')
          }

          // Create tags store (v2)
          if (!db.objectStoreNames.contains('tags')) {
            db.createObjectStore('tags', { keyPath: 'value' })
          }
        }
      },
      blocked() {
        console.warn('Database blocked - close other tabs using this app')
      },
      blocking() {
        // Close old connections when upgrade needed
        dbInstance?.close()
        dbInstance = null
      },
    })
    return dbInstance
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error)
    throw error
  }
}

/**
 * Migration stub for future schema changes
 * Currently at version 1 - no migrations needed yet
 */
export async function runMigrations(_db: IDBPDatabase<PomodoroDBSchema>): Promise<void> {
  // Future migrations can be added here
  // Example:
  // const oldVersion = await db.getMeta('version') || 0
  // if (oldVersion < 2) { /* migration logic */ }
  console.log(`Running migrations for schema version ${SCHEMA_VERSION}`)
}

/**
 * Check if IndexedDB is available (handles incognito mode)
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window
  } catch {
    return false
  }
}

/**
 * Validate timer state data - returns defaults if corrupted
 */
export function validateTimerState(data: unknown): TimerStateData | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const state = data as Record<string, unknown>

  // Check required fields
  const requiredFields = ['id', 'mode', 'duration', 'timeRemaining', 'isRunning', 'sessionCount']
  for (const field of requiredFields) {
    if (!(field in state)) {
      return null
    }
  }

  // Validate mode
  const validModes: TimerMode[] = ['focus', 'shortBreak', 'longBreak']
  if (!validModes.includes(state.mode as TimerMode)) {
    return null
  }

  // Validate numeric values are reasonable
  if (
    typeof state.duration !== 'number' ||
    typeof state.timeRemaining !== 'number' ||
    typeof state.sessionCount !== 'number' ||
    state.duration < 0 ||
    state.timeRemaining < 0 ||
    state.sessionCount < 0
  ) {
    return null
  }

  // Return validated data with defaults for optional fields
  return {
    id: String(state.id),
    mode: state.mode as TimerMode,
    duration: state.duration,
    timeRemaining: state.timeRemaining,
    isRunning: Boolean(state.isRunning),
    sessionCount: state.sessionCount,
    startTime: state.startTime as number | null,
    pausedTimeRemaining: state.pausedTimeRemaining as number | null,
    lastTick: state.lastTick as number | null,
    autoStart: state.autoStart === true,
    version: typeof state.version === 'number' ? state.version : SCHEMA_VERSION,
  }
}

/**
 * Convert TimerState to storable data format
 */
export function toStorableState(state: TimerState): TimerStateData {
  return {
    id: STATE_KEY,
    mode: state.mode,
    duration: state.duration,
    timeRemaining: state.timeRemaining,
    isRunning: state.isRunning,
    sessionCount: state.sessionCount,
    startTime: state.startTime,
    pausedTimeRemaining: state.pausedTimeRemaining,
    lastTick: state.startTime ? Date.now() : null,
    autoStart: false, // Default value
    version: SCHEMA_VERSION,
  }
}

/**
 * Convert stored data to TimerState format
 */
export function fromStoredState(stored: TimerStateData): TimerState {
  return {
    mode: stored.mode,
    duration: stored.duration,
    timeRemaining: stored.timeRemaining,
    isRunning: stored.isRunning,
    sessionCount: stored.sessionCount,
    startTime: stored.startTime,
    pausedTimeRemaining: stored.pausedTimeRemaining,
  }
}

/**
 * Get default timer state
 */
export function getDefaultState(): TimerState {
  return {
    mode: DEFAULT_STATE.mode,
    duration: DEFAULT_STATE.duration,
    timeRemaining: DEFAULT_STATE.timeRemaining,
    isRunning: false,
    sessionCount: DEFAULT_STATE.sessionCount,
    startTime: null,
    pausedTimeRemaining: null,
  }
}

/**
 * Clear all data from the database
 * Deletes all entries from sessions, tags, timerState, and settings stores
 */
export async function clearDatabase(): Promise<void> {
  const db = await initDB()

  // Clear all stores
  await db.clear('sessions')
  await db.clear('tags')
  await db.clear('timerState')
  await db.clear('settings')
}
