// Timer mode types
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

// Timer state interface
export interface TimerState {
  mode: TimerMode
  duration: number // in seconds
  timeRemaining: number // in seconds
  isRunning: boolean
  sessionCount: number
  startTime: number | null // timestamp when started
  pausedTimeRemaining: number | null // stored time when paused
}

// Timer action types for reducer
export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'TICK' }
  | { type: 'SET_MODE'; payload: TimerMode }
