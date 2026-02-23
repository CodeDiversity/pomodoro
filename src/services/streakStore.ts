import { initDB } from './db'

const STREAK_KEY = 'current'

export interface StreakData {
  id: string
  currentStreak: number
  bestStreak: number
  lastActiveDate: string | null
  protectionUsed: boolean
  version: number
}

/**
 * Save streak data to IndexedDB
 */
export async function saveStreak(streak: Omit<StreakData, 'id' | 'version'>): Promise<void> {
  const db = await initDB()
  await db.put('streak', {
    id: STREAK_KEY,
    ...streak,
    version: 1,
  } as StreakData)
}

/**
 * Load streak data from IndexedDB
 */
export async function loadStreak(): Promise<StreakData | undefined> {
  const db = await initDB()
  return db.get('streak', STREAK_KEY)
}
