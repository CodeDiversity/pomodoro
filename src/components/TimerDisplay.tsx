import styled from 'styled-components'
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

const DisplayContainer = styled.div<{ $backgroundColor: string }>`
  background-color: ${(props) => props.$backgroundColor};
  padding: 1.5rem 2.5rem;
  border-radius: 16px;
  text-align: center;
  color: white;
  min-width: 280px;
`

const ModeBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
`

const TimerText = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: 0.5rem;
`

const SessionCounter = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`

const RunningIndicator = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.8;
`

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
    <DisplayContainer $backgroundColor={backgroundColor}>
      <ModeBadge>{modeLabel}</ModeBadge>
      <TimerText>{formattedTime}</TimerText>
      <SessionCounter>
        Session {sessionCount} of {SESSIONS_BEFORE_LONG_BREAK}
      </SessionCounter>
      {isRunning && <RunningIndicator>Running...</RunningIndicator>}
    </DisplayContainer>
  )
}
