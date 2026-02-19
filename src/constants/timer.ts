import { TimerMode, TimerState } from '../types/timer'

// Timer durations in seconds
export const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

export const SESSIONS_BEFORE_LONG_BREAK = 4

export const DEFAULT_STATE: Omit<TimerState, 'startTime' | 'pausedTimeRemaining'> = {
  mode: 'focus',
  duration: DURATIONS.focus,
  timeRemaining: DURATIONS.focus,
  isRunning: false,
  sessionCount: 1,
}

// Mode display names
export const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

// Mode colors (background)
export const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#e74c3c',      // Red
  shortBreak: '#e67e22', // Orange
  longBreak: '#3498db',  // Blue
}
