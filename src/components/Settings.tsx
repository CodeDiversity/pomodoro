import React, { useState } from 'react'

interface SettingsProps {
  autoStart: boolean
  onAutoStartChange: (value: boolean) => void
}

export default function Settings({ autoStart, onAutoStartChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={containerStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
      >
        ⚙
      </button>

      {isOpen && (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>Settings</span>
            <button
              onClick={() => setIsOpen(false)}
              style={closeButtonStyle}
              aria-label="Close settings"
            >
              ×
            </button>
          </div>

          <div style={settingRowStyle}>
            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => onAutoStartChange(e.target.checked)}
                style={checkboxStyle}
              />
              Auto-start next session
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  position: 'relative',
}

const toggleButtonStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: '1px solid #e5e5e5',
  borderRadius: '50%',
  backgroundColor: 'white',
  color: '#666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  right: 0,
  marginBottom: '0.5rem',
  backgroundColor: 'white',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  padding: '0.75rem',
  minWidth: '200px',
  zIndex: 20,
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #f0f0f0',
}

const titleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#333',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  color: '#999',
  lineHeight: 1,
  padding: 0,
}

const settingRowStyle: React.CSSProperties = {
  padding: '0.25rem 0',
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8125rem',
  color: '#333',
  cursor: 'pointer',
}

const checkboxStyle: React.CSSProperties = {
  cursor: 'pointer',
}
