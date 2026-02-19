import { TimerMode } from '../types/timer'
import { MODE_LABELS, MODE_COLORS, SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'

interface TimerDisplayProps {
  timeRemaining: number
  mode: TimerMode
  sessionCount: number
  isRunning: boolean
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function TimerDisplay({
  timeRemaining,
  mode,
  sessionCount,
  isRunning,
}: TimerDisplayProps) {
  const backgroundColor = MODE_COLORS[mode]
  const modeLabel = MODE_LABELS[mode]
  const formattedTime = formatTime(timeRemaining)

  return (
    <div
      style={{
        backgroundColor,
        padding: '3rem 4rem',
        borderRadius: '16px',
        textAlign: 'center',
        color: 'white',
        minWidth: '320px',
      }}
    >
      {/* Mode Badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        {modeLabel}
      </div>

      {/* Timer Display - Hero Element */}
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 'bold',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          marginBottom: '1rem',
        }}
      >
        {formattedTime}
      </div>

      {/* Session Counter */}
      <div
        style={{
          fontSize: '1rem',
          opacity: 0.9,
        }}
      >
        Session {sessionCount} of {SESSIONS_BEFORE_LONG_BREAK}
      </div>

      {/* Running Indicator */}
      {isRunning && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}
        >
          Running...
        </div>
      )}
    </div>
  )
}
