import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { loadSettings as loadSettingsFromDB } from '../../services/persistence'

/**
 * Sound Settings State Interface
 *
 * Manages notification sound and volume preferences in Redux.
 * These settings persist across app restarts via IndexedDB.
 */
export interface SoundSettingsState {
  notificationSound: string
  volume: number
}

const initialState: SoundSettingsState = {
  notificationSound: 'beep',
  volume: 80,
}

/**
 * Async thunk to load settings from IndexedDB
 */
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async () => {
    const settings = await loadSettingsFromDB()
    return {
      notificationSound: settings.notificationSound || 'beep',
      volume: settings.volume ?? 80,
    }
  }
)

/**
 * Settings Slice
 *
 * Manages sound preferences state with the following actions:
 * - setNotificationSound: Update the notification sound type
 * - setVolume: Update the volume level (0-100)
 * - loadSettings: Async thunk to hydrate state from persistence
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationSound(state, action: PayloadAction<string>) {
      state.notificationSound = action.payload
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(100, action.payload))
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action) => {
      state.notificationSound = action.payload.notificationSound
      state.volume = action.payload.volume
    })
  },
})

export const {
  setNotificationSound,
  setVolume,
} = settingsSlice.actions

export default settingsSlice.reducer
