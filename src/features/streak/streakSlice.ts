import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Streak state interface
 */
export interface StreakState {
  currentStreak: number
  bestStreak: number
  lastActiveDate: string | null // YYYY-MM-DD format
  protectionUsed: boolean
  isLoaded: boolean
}

const initialState: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  protectionUsed: false,
  isLoaded: false,
}

export interface StreakPayload {
  currentStreak: number
  bestStreak: number
  lastActiveDate: string
  protectionUsed: boolean
}

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    /**
     * Update streak state with new values
     * Used after recalculating from session history
     */
    updateStreak(state, action: PayloadAction<StreakPayload>) {
      state.currentStreak = action.payload.currentStreak
      state.bestStreak = action.payload.bestStreak
      state.lastActiveDate = action.payload.lastActiveDate
      state.protectionUsed = action.payload.protectionUsed
      state.isLoaded = true
    },
    /**
     * Load streak state from persisted storage
     */
    loadStreak(state, action: PayloadAction<Omit<StreakState, 'isLoaded'>>) {
      state.currentStreak = action.payload.currentStreak
      state.bestStreak = action.payload.bestStreak
      state.lastActiveDate = action.payload.lastActiveDate
      state.protectionUsed = action.payload.protectionUsed
      state.isLoaded = true
    },
    /**
     * Mark protection as used
     * Called when user misses a day with 5+ day streak
     */
    useProtection(state) {
      state.protectionUsed = true
    },
    /**
     * Reset streak to initial state
     * For testing or user-initiated reset
     */
    resetStreak(state) {
      state.currentStreak = 0
      state.bestStreak = 0
      state.lastActiveDate = null
      state.protectionUsed = false
      state.isLoaded = false
    },
  },
})

export const { updateStreak, loadStreak, useProtection, resetStreak } = streakSlice.actions
export default streakSlice.reducer
