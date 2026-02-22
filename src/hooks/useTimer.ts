import { useEffect, useCallback, useRef, useState } from 'react'
import { TimerMode } from '../types/timer'
import { loadTimerState, loadSettings, saveSettings, DEFAULT_SETTINGS } from '../services/persistence'
import { notifySessionComplete, requestPermission } from '../services/notifications'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  start,
  pause,
  resume,
  reset,
  skip,
  setMode,
  setCustomDurations,
  loadState,
  tick,
  CustomDurations,
} from '../features/timer/timerSlice'

interface UseTimerOptions {
  onSessionComplete?: () => void
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onSessionComplete } = options
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) => s.timer)
  const [autoStart, setAutoStartState] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const previousTimeRef = useRef<number>(state.timeRemaining)
  const autoStartRef = useRef(false)

  // Load persisted state and settings on mount
  useEffect(() => {
    let mounted = true

    async function loadStateAsync() {
      try {
        // Load settings first
        const settings = await loadSettings()

        // Load timer state
        const loadedState = await loadTimerState()

        if (mounted) {
          dispatch(loadState(loadedState))
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
            dispatch(
              setCustomDurations({
                focus: settings.focusDuration,
                shortBreak: settings.shortBreakDuration,
                longBreak: settings.longBreakDuration,
              })
            )
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

    loadStateAsync()

    return () => {
      mounted = false
    }
  }, [dispatch])

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
        dispatch(tick())
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
  }, [state.isRunning, state.startTime, dispatch])

  // Handle background tab visibility changes - recalculate timer when tab becomes visible
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && state.isRunning && state.startTime) {
        // Recalculate time remaining based on elapsed time since last tick
        dispatch(tick())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state.isRunning, state.startTime, dispatch])

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
        dispatch(skip())

        // Auto-start next session if enabled
        if (autoStartRef.current) {
          setTimeout(() => {
            dispatch(start())
          }, 100)
        }
      }, 100)
    }

    // Update previous time ref
    previousTimeRef.current = state.timeRemaining
  }, [state.timeRemaining, state.mode, onSessionComplete, dispatch])

  const startTimer = useCallback(() => {
    dispatch(start())
  }, [dispatch])

  const pauseTimer = useCallback(() => {
    dispatch(pause())
  }, [dispatch])

  const resumeTimer = useCallback(() => {
    dispatch(resume())
  }, [dispatch])

  const resetTimer = useCallback(() => {
    dispatch(reset())
  }, [dispatch])

  const skipTimer = useCallback(() => {
    dispatch(skip())
  }, [dispatch])

  const setModeTimer = useCallback(
    (mode: TimerMode) => {
      dispatch(setMode(mode))
    },
    [dispatch]
  )

  const setAutoStartTimer = useCallback(
    (value: boolean) => {
      setAutoStartState(value)
      autoStartRef.current = value
      saveSettings({
        autoStart: value,
        focusDuration: state.duration,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        notificationSound: DEFAULT_SETTINGS.notificationSound,
        volume: DEFAULT_SETTINGS.volume,
      })
    },
    [state.duration]
  )

  const setCustomDurationsTimer = useCallback(
    (durations: CustomDurations) => {
      // Dispatch to Redux to update timer state
      dispatch(setCustomDurations(durations))
      // Persist to IndexedDB
      saveSettings({
        autoStart: autoStartRef.current,
        focusDuration: durations.focus,
        shortBreakDuration: durations.shortBreak,
        longBreakDuration: durations.longBreak,
        notificationSound: DEFAULT_SETTINGS.notificationSound,
        volume: DEFAULT_SETTINGS.volume,
      })
    },
    [dispatch]
  )

  return {
    state,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
    skip: skipTimer,
    setMode: setModeTimer,
    autoStart,
    setAutoStart: setAutoStartTimer,
    setCustomDurations: setCustomDurationsTimer,
  }
}
