import React, { useState } from 'react'

interface TimerControlsProps {
  isRunning: boolean
  startTime: number | null
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
}

export default function TimerControls({
  isRunning,
  startTime,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
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

  return (
    <div style={containerStyle}>
      {/* Primary Control: Play/Pause */}
      <button
        onClick={handlePrimaryClick}
        style={primaryButtonStyle}
        aria-label={getPrimaryButtonLabel()}
      >
        {isRunning ? (
          <span style={iconStyle}>⏸</span>
        ) : (
          <span style={iconStyle}>▶</span>
        )}
        <span>{getPrimaryButtonLabel()}</span>
      </button>

      {/* Secondary Controls Menu */}
      <div style={menuContainerStyle}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={menuToggleStyle}
          aria-label="More options"
        >
          ⋮
        </button>

        {showMenu && (
          <div style={menuStyle}>
            <button
              onClick={() => {
                onReset()
                setShowMenu(false)
              }}
              style={menuItemStyle}
            >
              Reset
            </button>
            <button
              onClick={() => {
                onSkip()
                setShowMenu(false)
              }}
              style={menuItemStyle}
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#333',
  color: 'white',
  transition: 'background-color 0.2s',
}

const iconStyle: React.CSSProperties = {
  fontSize: '0.875rem',
}

const menuContainerStyle: React.CSSProperties = {
  position: 'relative',
}

const menuToggleStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  fontSize: '1.25rem',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: 'transparent',
  color: '#666',
  lineHeight: 1,
}

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '0.25rem',
  backgroundColor: 'white',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  zIndex: 10,
  overflow: 'hidden',
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  textAlign: 'left',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#333',
}
