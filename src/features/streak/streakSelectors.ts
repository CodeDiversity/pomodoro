import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

/**
 * Select current streak count
 */
export const selectCurrentStreak = (state: RootState) => state.streak.currentStreak

/**
 * Select best (longest) streak
 */
export const selectBestStreak = (state: RootState) => state.streak.bestStreak

/**
 * Select last active date (YYYY-MM-DD)
 */
export const selectLastActiveDate = (state: RootState) => state.streak.lastActiveDate

/**
 * Select whether protection has been used
 */
export const selectProtectionUsed = (state: RootState) => state.streak.protectionUsed

/**
 * Select whether streak data has been loaded from storage
 */
export const selectStreakLoaded = (state: RootState) => state.streak.isLoaded

/**
 * Select has active protection
 * Returns true if currentStreak >= 5 AND protection not used
 */
export const selectHasProtection = createSelector(
  [selectCurrentStreak, selectProtectionUsed],
  (currentStreak, protectionUsed) => currentStreak >= 5 && !protectionUsed
)
