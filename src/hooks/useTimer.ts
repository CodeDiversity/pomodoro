import { useReducer, useEffect, useCallback, useRef } from 'react'
import { TimerState, TimerAction, TimerMode } from '../types/timer'
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'
import { loadTimerState, saveTimerState, saveTimerStateImmediate } from '../services/persistence'
import { notifySessionComplete, requestPermission } from '../services/notifications'

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        isRunning: true,
        startTime: Date.now(),
        pausedTimeRemaining: null,
      }

    case 'PAUSE':
      return {
        ...state,
        isRunning: false,
        pausedTimeRemaining: state.timeRemaining,
        startTime: null,
      }

    case 'RESUME':
      return {
        ...state,
        isRunning: true,
        startTime: Date.now(),
      }

    case 'RESET':
      return {
        ...state,
        timeRemaining: state.duration,
        isRunning: false,
        startTime: null,
        pausedTimeRemaining: null,
      }

    case 'SKIP': {
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

      return {
        ...state,
        mode: nextMode,
        duration: DURATIONS[nextMode],
        timeRemaining: DURATIONS[nextMode],
        sessionCount: nextSessionCount,
        isRunning: false,
        startTime: null,
        pausedTimeRemaining: null,
      }
    }

    case 'TICK': {
      if (!state.startTime) return state
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000)
      const remaining = Math.max(0, state.duration - elapsed)
      return {
        ...state,
        timeRemaining: remaining,
      }
    }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        duration: DURATIONS[action.payload],
        timeRemaining: DURATIONS[action.payload],
        isRunning: false,
        startTime: null,
        pausedTimeRemaining: null,
      }

    case 'LOAD_STATE':
      // Used to load persisted state
      return action.payload

    default:
      return state
  }
}

const initialState: TimerState = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
  startTime: null,
  pausedTimeRemaining: null,
}

export function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState)
  const intervalRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const previousTimeRef = useRef<number>(state.timeRemaining)

  // Load persisted state on mount
  useEffect(() => {
    let mounted = true

    async function loadState() {
      try {
        const loadedState = await loadTimerState()
        if (mounted) {
          dispatch({ type: 'LOAD_STATE', payload: loadedState })
          isInitializedRef.current = true
        }
      } catch (error) {
        console.error('Failed to load timer state:', error)
        if (mounted) {
          isInitializedRef.current = true
        }
      }
    }

    loadState()

    return () => {
      mounted = false
    }
  }, [])

  // Request notification permission on first user interaction
  useEffect(() => {
    function handleFirstInteraction() {
      requestPermission()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  // Handle tick updates
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      intervalRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRunning, state.startTime])

  // Handle persistence: save while running
  useEffect(() => {
    // Only save after initial load is complete
    if (!isInitializedRef.current) {
      return
    }

    // Save when running (debounced internally)
    if (state.isRunning) {
      saveTimerState(state)
    } else {
      // Save immediately when paused or stopped
      saveTimerStateImmediate(state)
    }
  }, [state])

  // Handle session completion (time reached 0)
  useEffect(() => {
    // Only check after initial load
    if (!isInitializedRef.current) {
      return
    }

    // Detect when time goes from > 0 to 0
    const wasRunning = previousTimeRef.current > 0
    const isNowComplete = state.timeRemaining === 0

    if (wasRunning && isNowComplete) {
      // Session completed - notify user
      notifySessionComplete(state.mode)

      // Auto-advance to next session after a brief delay
      setTimeout(() => {
        dispatch({ type: 'SKIP' })
      }, 100)
    }

    // Update previous time ref
    previousTimeRef.current = state.timeRemaining
  }, [state.timeRemaining, state.mode])

  const start = useCallback(() => {
    dispatch({ type: 'START' })
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' })
  }, [])

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const skip = useCallback(() => {
    dispatch({ type: 'SKIP' })
  }, [])

  const setMode = useCallback((mode: TimerMode) => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
  }
}
