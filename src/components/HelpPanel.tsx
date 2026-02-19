import { useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
`

const ToggleButton = styled.button`
  width: 28px;
  height: 28px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  background-color: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f5f5f5;
  }
`

const Panel = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
  background-color: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  min-width: 200px;
  z-index: 20;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
`

const Title = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;

  &:hover {
    color: #666;
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
  background-color: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  color: #333;
`

const Description = styled.span`
  font-size: 0.8125rem;
  color: #666;
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
