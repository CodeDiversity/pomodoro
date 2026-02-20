import { useReducer, useEffect, useCallback, useRef, useState } from 'react'
import { TimerState, TimerAction, TimerMode } from '../types/timer'
import { DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'
import { loadTimerState, saveTimerState, saveTimerStateImmediate, loadSettings, saveSettings } from '../services/persistence'
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

    case 'SET_CUSTOM_DURATIONS': {
      // Determine the duration for the current mode
      const { focus, shortBreak, longBreak } = action.payload
      const durationMap = {
        focus,
        shortBreak,
        longBreak,
      }
      const newDuration = durationMap[state.mode]

      // When timer is running, reset it to new duration (DUR-08)
      // When timer is idle, just update the timer display
      return {
        ...state,
        duration: newDuration,
        timeRemaining: newDuration,
        isRunning: false,
        startTime: null,
        pausedTimeRemaining: null,
      }
    }

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

interface UseTimerOptions {
  onSessionComplete?: () => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionComplete } = options
  const [state, dispatch] = useReducer(timerReducer, initialState)
  const [autoStart, setAutoStartState] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const previousTimeRef = useRef<number>(state.timeRemaining)
  const autoStartRef = useRef(false)

  // Load persisted state and settings on mount
  useEffect(() => {
    let mounted = true

    async function loadState() {
      try {
        // Load settings first
        const settings = await loadSettings()

        // Load timer state
        const loadedState = await loadTimerState()

        if (mounted) {
          dispatch({ type: 'LOAD_STATE', payload: loadedState })
          setAutoStartState(settings.autoStart)
          autoStartRef.current = settings.autoStart

          // Apply custom durations if they exist (different from defaults)
          const defaultFocus = 25 * 60
          const defaultShortBreak = 5 * 60
          const defaultLongBreak = 15 * 60

          const hasCustomFocus = settings.focusDuration !== defaultFocus
          const hasCustomShortBreak = settings.shortBreakDuration !== defaultShortBreak
          const hasCustomLongBreak = settings.longBreakDuration !== defaultLongBreak

          if (hasCustomFocus || hasCustomShortBreak || hasCustomLongBreak) {
            dispatch({
              type: 'SET_CUSTOM_DURATIONS',
              payload: {
                focus: settings.focusDuration,
                shortBreak: settings.shortBreakDuration,
                longBreak: settings.longBreakDuration,
              },
            })
          }

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

      // Call session complete callback for focus sessions
      if (state.mode === 'focus') {
        onSessionComplete?.()
      }

      // Auto-advance to next session after a brief delay
      setTimeout(() => {
        dispatch({ type: 'SKIP' })

        // Auto-start next session if enabled
        if (autoStartRef.current) {
          setTimeout(() => {
            dispatch({ type: 'START' })
          }, 100)
        }
      }, 100)
    }

    // Update previous time ref
    previousTimeRef.current = state.timeRemaining
  }, [state.timeRemaining, state.mode, onSessionComplete])

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

  const setAutoStart = useCallback((value: boolean) => {
    setAutoStartState(value)
    autoStartRef.current = value
    saveSettings({
      autoStart: value,
      focusDuration: state.duration,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
    })
  }, [state.duration])

  const setCustomDurations = useCallback((durations: { focus: number; shortBreak: number; longBreak: number }) => {
    // Dispatch to reducer to update timer state
    dispatch({ type: 'SET_CUSTOM_DURATIONS', payload: durations })
    // Persist to IndexedDB
    saveSettings({
      autoStart: autoStartRef.current,
      focusDuration: durations.focus,
      shortBreakDuration: durations.shortBreak,
      longBreakDuration: durations.longBreak,
    })
  }, [])

  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
    autoStart,
    setAutoStart,
    setCustomDurations,
  }
}
