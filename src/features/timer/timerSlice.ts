import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerState, TimerMode } from '../../types/timer'
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../../constants/timer'

const initialState: TimerState = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
}

export interface CustomDurations {
  focus: number
  shortBreak: number
  longBreak: number
}

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    start(state) {
      state.isRunning = true
      state.startTime = Date.now()
      state.pausedTimeRemaining = null
    },

    pause(state) {
      state.isRunning = false
      state.pausedTimeRemaining = state.timeRemaining
      state.startTime = null
    },

    resume(state) {
      state.isRunning = true
      state.startTime = Date.now()
    },

    reset(state) {
      state.timeRemaining = state.duration
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },

    tick(state) {
      if (!state.startTime) return
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
      state.timeRemaining = Math.max(0, state.duration - elapsed)
    },

    skip(state) {
      const isFocusMode = state.mode === 'focus'
      let nextMode: TimerMode
      let nextSessionCount = state.sessionCount

      if (isFocusMode) {
        // After focus, determine break type based on session count
        if (state.sessionCount >= SESSIONS_BEFORE_LONG_BREAK) {
          nextMode = 'longBreak'
          nextSessionCount = 1 // Reset session count after long break
        } else {
          nextMode = 'shortBreak'
        }
      } else {
        // After any break, go to focus mode
        nextMode = 'focus'
        if (state.mode === 'shortBreak') {
          nextSessionCount = state.sessionCount + 1
        }
      }

      state.mode = nextMode
      state.duration = DURATIONS[nextMode]
      state.timeRemaining = DURATIONS[nextMode]
      state.sessionCount = nextSessionCount
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },

    setMode(state, action: PayloadAction<TimerMode>) {
      state.mode = action.payload
      state.duration = DURATIONS[action.payload]
      state.timeRemaining = DURATIONS[action.payload]
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },

    setCustomDurations(state, action: PayloadAction<CustomDurations>) {
      const { focus, shortBreak, longBreak } = action.payload
      const durationMap = {
        focus,
        shortBreak,
        longBreak,
      }
      const newDuration = durationMap[state.mode]

      state.duration = newDuration
      state.timeRemaining = newDuration
      state.isRunning = false
      state.startTime = null
      state.pausedTimeRemaining = null
    },

    loadState(state, action: PayloadAction<TimerState>) {
      return action.payload
    },
  },
})

export const {
  start,
  pause,
  resume,
  reset,
  tick,
  skip,
  setMode,
  setCustomDurations,
  loadState,
} = timerSlice.actions

export default timerSlice.reducer
