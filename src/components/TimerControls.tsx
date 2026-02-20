import { useState } from 'react'
import styled from 'styled-components'

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
  align-items: center;
  gap: 0.25rem;
`

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #333;
  color: white;
  transition: background-color 0.2s;

  &:hover {
    background-color: #444;
  }
`

const Icon = styled.span`
  font-size: 0.875rem;
`

const MenuContainer = styled.div`
  position: relative;
`

const MenuToggle = styled.button`
  padding: 0.5rem 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: #666;
  line-height: 1;

  &:hover {
    background-color: #f5f5f5;
  }
`

const Menu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background-color: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
`

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  border: none;
  background-color: transparent;
  color: #333;

  &:hover {
    background-color: #f5f5f5;
  }
`

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
  const [showMenu, setShowMenu] = useState(false)

  const isPaused = !isRunning && startTime !== null

  const getPrimaryButtonLabel = () => {
    if (isRunning) return 'Pause'
    if (isPaused) return 'Resume'
    return 'Start'
  }

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
      <PrimaryButton onClick={handlePrimaryClick} aria-label={getPrimaryButtonLabel()}>
        {isRunning ? <Icon>⏸</Icon> : <Icon>▶</Icon>}
        <span>{getPrimaryButtonLabel()}</span>
      </PrimaryButton>

      <MenuContainer>
        <MenuToggle onClick={() => setShowMenu(!showMenu)} aria-label="More options">
          ⋮
        </MenuToggle>

        {showMenu && (
          <Menu>
            <MenuItem
              onClick={() => {
                handleReset()
                setShowMenu(false)
              }}
            >
              Reset
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSkip()
                setShowMenu(false)
              }}
            >
              Skip
            </MenuItem>
          </Menu>
        )}
      </MenuContainer>
    </Container>
  )
}
