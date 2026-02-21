import styled from 'styled-components'
import { TimerMode } from '../types/timer'
import { SESSIONS_BEFORE_LONG_BREAK } from '../constants/timer'

interface TimerDisplayProps {
  timeRemaining: number
  duration: number
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
  justify-content: center;
  gap: 24px;
  height: 100%;
  width: 100%;
`

const Badge = styled.div`
  display: inline-block;
  padding: 6px 16px;
  background-color: rgba(19, 109, 236, 0.05);
  color: #136dec;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(19, 109, 236, 0.1);
`

const CircleContainer = styled.div`
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const OuterRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 12px solid #f1f5f9;
  transform: scale(1.1);
`

const SVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
`

const CircleTrack = styled.circle`
  fill: none;
  stroke: transparent;
  stroke-width: 12px;
`

const CircleProgress = styled.circle`
  fill: none;
  stroke: #136dec;
  stroke-width: 12px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
`

const TimeText = styled.div`
  font-size: 4.5rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #1A1A1A;
  line-height: 1;
  z-index: 1;
  letter-spacing: -0.02em;
  padding: 20px;
`

const RemainingLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 4px;
  z-index: 1;
`

const DailyGoalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 200px;
  margin-top: 8px;
`

const DailyGoalLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const DailyGoalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const DailyGoalText = styled.div`
  font-size: 0.9rem;
  color: #1A1A1A;
  font-weight: 700;
`

const DailyGoalPercentage = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`

const ProgressBarFill = styled.div<{ $progress: number }>`
  width: ${props => props.$progress * 100}%;
  height: 100%;
  background-color: #136dec;
  border-radius: 3px;
  transition: width 0.3s ease;
`

export default function TimerDisplay({
  timeRemaining,
  duration,
  mode,
  sessionCount,
}: TimerDisplayProps) {
  const formattedTime = formatTime(timeRemaining)

  // Calculate progress based on actual duration
  const progress = (duration - timeRemaining) / duration

  // SVG circle calculations
  const radius = 140
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const dashoffset = circumference * (1 - progress)

  // Daily goal progress
  const dailyGoalProgress = Math.min(sessionCount / SESSIONS_BEFORE_LONG_BREAK, 1)

  return (
    <Container>
      {mode === 'focus' && <Badge>DEEP WORK</Badge>}

      <CircleContainer>
        <OuterRing />
        <SVG width="320" height="320">
          <CircleTrack
            cx={160}
            cy={160}
            r={normalizedRadius}
          />
          <CircleProgress
            cx={160}
            cy={160}
            r={normalizedRadius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashoffset}
          />
        </SVG>
        <TimeText>{formattedTime}</TimeText>
        <RemainingLabel>Remaining</RemainingLabel>
      </CircleContainer>

      <DailyGoalContainer>
        <DailyGoalLabel>Daily Goal</DailyGoalLabel>
        <DailyGoalRow>
          <DailyGoalText>
            {sessionCount}/{SESSIONS_BEFORE_LONG_BREAK} Sessions
          </DailyGoalText>
          <DailyGoalPercentage>{Math.round(dailyGoalProgress * 100)}%</DailyGoalPercentage>
        </DailyGoalRow>
        <ProgressBarContainer>
          <ProgressBarFill $progress={dailyGoalProgress} />
        </ProgressBarContainer>
      </DailyGoalContainer>
    </Container>
  )
}
