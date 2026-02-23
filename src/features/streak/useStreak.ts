import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  selectCurrentStreak,
  selectBestStreak,
  selectProtectionUsed,
  selectHasProtection,
} from './streakSelectors'
import { loadStreak, updateStreak } from './streakSlice'
import { groupSessionsByDay, calculateStreaks } from '../../utils/streakUtils'
import { getAllSessions } from '../../services/sessionStore'
import { initDB } from '../../services/db'

const STREAK_KEY = 'current'

interface StreakData {
  id: string
  currentStreak: number
  bestStreak: number
  lastActiveDate: string | null
  protectionUsed: boolean
  version: number
}

/**
 * Load streak data from IndexedDB
 */
async function loadStreakFromDB(): Promise<Omit<StreakData, 'id' | 'version'> | null> {
  try {
    const db = await initDB()
    const stored = await db.get('streak', STREAK_KEY)

    if (!stored) {
      return null
    }

    return {
      currentStreak: stored.currentStreak,
      bestStreak: stored.bestStreak,
      lastActiveDate: stored.lastActiveDate,
      protectionUsed: stored.protectionUsed,
    }
  } catch (error) {
    console.error('Failed to load streak from DB:', error)
    return null
  }
}

/**
 * Custom hook for streak data and operations
 *
 * Provides:
 * - currentStreak: current consecutive day count
 * - bestStreak: longest streak ever achieved
 * - protectionUsed: whether streak protection has been used
 * - hasProtection: whether streak protection is active (5+ streak, not used)
 * - recalculateStreak: recalculate streak from session history
 * - loadStreakFromStorage: load streak from IndexedDB
 */
export function useStreak() {
  const dispatch = useAppDispatch()

  const currentStreak = useAppSelector(selectCurrentStreak)
  const bestStreak = useAppSelector(selectBestStreak)
  const protectionUsed = useAppSelector(selectProtectionUsed)
  const hasProtection = useAppSelector(selectHasProtection)
  const isLoaded = useAppSelector((state) => state.streak.isLoaded)

  /**
   * Load streak from IndexedDB storage
   */
  const loadStreakFromStorage = async () => {
    const storedStreak = await loadStreakFromDB()
    if (storedStreak) {
      dispatch(loadStreak(storedStreak))
    }
  }

  /**
   * Recalculate streak from session history
   * This should be called on app load and after each session completion
   */
  const recalculateStreak = async () => {
    try {
      // Get all sessions from IndexedDB
      const sessions = await getAllSessions()

      // Group sessions by day
      const dailyActivity = groupSessionsByDay(sessions)

      // Get current state (use Redux state as baseline)
      const currentState = {
        currentStreak,
        bestStreak,
        lastActiveDate: null as string | null,
        protectionUsed,
      }

      // If not loaded yet, get from storage first
      if (!isLoaded) {
        const stored = await loadStreakFromDB()
        if (stored) {
          currentState.currentStreak = stored.currentStreak
          currentState.bestStreak = stored.bestStreak
          currentState.lastActiveDate = stored.lastActiveDate
          currentState.protectionUsed = stored.protectionUsed
        }
      } else {
        // Use current Redux state
        const state = await new Promise<typeof currentState>((resolve) => {
          // We need to get this from the store directly
          // For now, use the Redux state values
          resolve({
            currentStreak,
            bestStreak,
            lastActiveDate: null,
            protectionUsed,
          })
        })
        Object.assign(currentState, state)
      }

      // Calculate new streak values
      const newStreakData = calculateStreaks(
        dailyActivity,
        currentState.currentStreak,
        currentState.bestStreak,
        currentState.lastActiveDate,
        currentState.protectionUsed
      )

      // Ensure lastActiveDate is never null when dispatching
      const lastActiveDate = newStreakData.lastActiveDate || currentState.lastActiveDate || ''

      // Only dispatch if there's meaningful data
      if (lastActiveDate) {
        dispatch(
          updateStreak({
            currentStreak: newStreakData.currentStreak,
            bestStreak: newStreakData.bestStreak,
            lastActiveDate,
            protectionUsed: newStreakData.protectionUsed,
          })
        )
      }
    } catch (error) {
      console.error('Failed to recalculate streak:', error)
    }
  }

  // On mount: load from storage and recalculate
  useEffect(() => {
    loadStreakFromStorage().then(() => {
      recalculateStreak()
    })
  }, [])

  return {
    currentStreak,
    bestStreak,
    protectionUsed,
    hasProtection,
    recalculateStreak,
    loadStreakFromStorage,
  }
}
