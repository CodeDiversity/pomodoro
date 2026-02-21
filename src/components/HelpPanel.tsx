import { useState } from 'react'
import styled from 'styled-components'
import { colors, radii, shadows, transitions } from './ui/theme'

const Container = styled.div`
  position: relative;
`

const ToggleButton = styled.button`
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${colors.border};
  border-radius: 50%;
  background-color: ${colors.background};
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${transitions.normal};

  &:hover {
    background-color: ${colors.surface};
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const Panel = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  background-color: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${radii.lg};
  box-shadow: ${shadows.lg};
  padding: 0.75rem;
  min-width: 200px;
  z-index: 20;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${colors.surface};
`

const Title = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${colors.textMuted};
  line-height: 1;
  padding: 0;
  transition: color ${transitions.fast};

  &:hover {
    color: ${colors.text};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
    border-radius: 2px;
  }
`

const ShortcutList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ShortcutItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
`

const Kbd = styled.kbd`
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background-color: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radii.sm};
  color: ${colors.text};
`

const Description = styled.span`
  font-size: 0.8125rem;
  color: ${colors.textMuted};
`

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    { key: 'Space', description: 'Start / Pause / Resume' },
    { key: 'Cmd+K', description: 'Search (coming soon)' },
  ]

  return (
    <Container>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        ?
      </ToggleButton>

      {isOpen && (
        <Panel>
          <Header>
            <Title>Keyboard Shortcuts</Title>
            <CloseButton onClick={() => setIsOpen(false)} aria-label="Close help">
              ×
            </CloseButton>
          </Header>
          <ShortcutList>
            {shortcuts.map((shortcut) => (
              <ShortcutItem key={shortcut.key}>
                <Kbd>{shortcut.key}</Kbd>
                <Description>{shortcut.description}</Description>
              </ShortcutItem>
            ))}
          </ShortcutList>
        </Panel>
      )}
    </Container>
  )
}
