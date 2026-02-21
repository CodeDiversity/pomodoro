import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

const Container = styled.div`
  position: relative;
`

const ToggleButton = styled.button`
  width: 40px;
  height: 40px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #E0E0E0;
  border-radius: 50%;
  background-color: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.normal};

  &:hover {
    background-color: #F5F5F5;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

// Modal overlay
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

// Modal container
const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  padding: 24px;
  animation: modalSlideIn 0.2s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all ${transitions.fast};

  &:hover {
    background-color: #F5F5F5;
    color: #333;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const ShortcutList = styled.ul`
  list-style: none;
  margin: 0 0 20px 0;
  padding: 0;
`

const ShortcutItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;

  &:last-child {
    border-bottom: none;
  }
`

const KeyName = styled.span`
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
`

const KeyCombo = styled.kbd`
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.85rem;
  padding: 4px 10px;
  background: #F5F5F5;
  border-radius: 4px;
  color: #666;
  border: 1px solid #E8E8E8;
`

const TipCard = styled.div`
  background: #F0F7FF;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.85rem;
  color: ${colors.primary};
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`

const TipIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
`

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: 'Space', description: 'Start / Pause / Resume' },
    { key: '?', description: 'Show / Hide this help' },
    { key: 'Esc', description: 'Close modals / panels' },
  ]

  // Handle keyboard shortcut to open/close help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <Container>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </ToggleButton>

      {isOpen && (
        <Overlay onClick={handleOverlayClick}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Header>
              <Title>Keyboard Shortcuts</Title>
              <CloseButton onClick={() => setIsOpen(false)} aria-label="Close help">
                ×
              </CloseButton>
            </Header>

            <ShortcutList>
              {shortcuts.map((shortcut) => (
                <ShortcutItem key={shortcut.key}>
                  <KeyName>{shortcut.description}</KeyName>
                  <KeyCombo>{shortcut.key}</KeyCombo>
                </ShortcutItem>
              ))}
            </ShortcutList>

            <TipCard>
              <TipIcon>💡</TipIcon>
              <span>Tip: Press ? anytime to show this help</span>
            </TipCard>
          </Modal>
        </Overlay>
      )}
    </Container>
  )
}
