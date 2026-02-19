import React, { useState } from 'react'

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: 'Space', description: 'Start / Pause / Resume' },
    { key: 'Cmd+K', description: 'Search (coming soon)' },
  ]

  return (
    <div style={containerStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={toggleButtonStyle}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        ?
      </button>

      {isOpen && (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>Keyboard Shortcuts</span>
            <button
              onClick={() => setIsOpen(false)}
              style={closeButtonStyle}
              aria-label="Close help"
            >
              ×
            </button>
          </div>
          <ul style={listStyle}>
            {shortcuts.map((shortcut) => (
              <li key={shortcut.key} style={listItemStyle}>
                <kbd style={kbdStyle}>{shortcut.key}</kbd>
                <span style={descriptionStyle}>{shortcut.description}</span>
              </li>
            ))}
          </ul>
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
  fontWeight: 600,
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
  left: '50%',
  transform: 'translateX(-50%)',
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

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

const listItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.25rem 0',
}

const kbdStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  padding: '0.125rem 0.375rem',
  backgroundColor: '#f5f5f5',
  border: '1px solid #e5e5e5',
  borderRadius: '4px',
  color: '#333',
}

const descriptionStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: '#666',
}
