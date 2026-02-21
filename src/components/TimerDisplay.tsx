import styled from 'styled-components'
import { TimerMode } from '../types/timer'
import { SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`

const Badge = styled.div`
  display: inline-block;
  padding: 6px 16px;
  background-color: #F0F7FF;
  color: #0066FF;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const CircleContainer = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
`

const CircleTrack = styled.circle`
  fill: none;
  stroke: #E8E8E8;
  stroke-width: 8px;
`

const CircleProgress = styled.circle`
  fill: none;
  stroke: #0066FF;
  stroke-width: 8px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
`

const TimeText = styled.div`
  font-size: 4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1A1A1A;
  line-height: 1;
  z-index: 1;
`

const DailyGoalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const DailyGoalText = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`

const ProgressBarContainer = styled.div`
  width: 200px;
  height: 6px;
  background-color: #E8E8E8;
  border-radius: 3px;
  overflow: hidden;
`

const ProgressBarFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress * 100}%;
  height: 100%;
  background-color: #0066FF;
  border-radius: 3px;
  transition: width 0.3s ease;
`

export default function TimerDisplay({
  timeRemaining,
  mode,
  sessionCount,
}: TimerDisplayProps) {
  // isRunning prop available for future use (e.g., pulsing animation)
  const formattedTime = formatTime(timeRemaining)

  // Calculate progress based on mode
  const getTotalDuration = () => {
    switch (mode) {
      case 'focus':
        return 25 * 60 // 25 minutes
      case 'shortBreak':
        return 5 * 60 // 5 minutes
      case 'longBreak':
        return 15 * 60 // 15 minutes
      default:
        return 25 * 60
    }
  }

  const totalDuration = getTotalDuration()
  const progress = (totalDuration - timeRemaining) / totalDuration

  // SVG circle calculations
  const radius = 120
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const dashoffset = circumference * (1 - progress)

  // Daily goal progress (sessionCount out of SESSIONS_BEFORE_LONG_BREAK)
  const dailyGoalProgress = Math.min(sessionCount / SESSIONS_BEFORE_LONG_BREAK, 1)

  return (
    <Container>
      {mode === 'focus' && <Badge>DEEP WORK</Badge>}

      <CircleContainer>
        <SVG width="240" height="240">
          <CircleTrack
            cx={radius}
            cy={radius}
            r={normalizedRadius}
          />
          <CircleProgress
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashoffset}
          />
        </SVG>
        <TimeText>{formattedTime}</TimeText>
      </CircleContainer>

      <DailyGoalContainer>
        <DailyGoalText>
          {sessionCount}/{SESSIONS_BEFORE_LONG_BREAK} Sessions
        </DailyGoalText>
        <ProgressBarContainer>
          <ProgressBarFill $progress={dailyGoalProgress} />
        </ProgressBarContainer>
      </DailyGoalContainer>
    </Container>
  )
}
