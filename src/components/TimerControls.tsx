import { useState } from 'react'
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
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const PrimaryButton = styled.button`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #0066FF;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: #0052CC;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 102, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
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

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #E0E0E0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: #F5F5F5;
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

const SecondaryButtonsRow = styled.div`
  display: flex;
  gap: 12px;
`

// SVG Icons (20x20, stroke-width 2)
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

const SkipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
)

const ResetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
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
      <PrimaryButton
        onClick={handlePrimaryClick}
        aria-label={isRunning ? 'Pause' : isPaused ? 'Resume' : 'Start'}
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
      </PrimaryButton>

      <SecondaryButtonsRow>
        <IconButton
          onClick={handleSkip}
          aria-label="Skip session"
          title="Skip session"
        >
          <SkipIcon />
        </IconButton>
        <IconButton
          onClick={handleReset}
          aria-label="Reset timer"
          title="Reset timer"
        >
          <ResetIcon />
        </IconButton>
      </SecondaryButtonsRow>
    </Container>
  )
}
