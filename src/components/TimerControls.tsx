import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

interface TimerControlsProps {
  isRunning: boolean
  startTime: number | null
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
  onSessionSkip?: () => void
  onSessionReset?: () => void
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
`

const PrimaryButton = styled.button`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #136dec;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(19, 109, 236, 0.4);
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: #0d5bc4;
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.normal};
  color: #64748b;

  &:hover:not(:disabled) {
    border-color: #136dec;
    color: #136dec;
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// Material Symbols style icons
const PlayIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const PauseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
)

const SkipIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
)

const ResetIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
  </svg>
)

export default function TimerControls({
  isRunning,
  startTime,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onSessionSkip,
  onSessionReset,
}: TimerControlsProps) {
  const isPaused = !isRunning && startTime !== null

  const getPrimaryButtonAction = () => {
    if (isRunning) return onPause
    if (isPaused) return onResume
    return onStart
  }

  const handlePrimaryClick = () => {
    getPrimaryButtonAction()()
  }

  const handleReset = () => {
    onSessionReset?.()
    onReset()
  }

  const handleSkip = () => {
    onSessionSkip?.()
    onSkip()
  }

  return (
    <Container>
      <SecondaryButton
        onClick={handleReset}
        aria-label="Reset timer"
        title="Reset timer"
      >
        <ResetIcon />
      </SecondaryButton>

      <PrimaryButton
        onClick={handlePrimaryClick}
        aria-label={isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start'}
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </PrimaryButton>

      <SecondaryButton
        onClick={handleSkip}
        aria-label="Skip session"
        title="Skip session"
      >
        <SkipIcon />
      </SecondaryButton>
    </Container>
  )
}
