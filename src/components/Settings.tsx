import { useState } from 'react'
import styled from 'styled-components'

interface SettingsProps {
  autoStart: boolean
  onAutoStartChange: (value: boolean) => void
}

const Container = styled.div`
  position: relative;
`

const ToggleButton = styled.button`
  width: 28px;
  height: 28px;
  font-size: 0.875rem;
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
  right: 0;
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

const SettingRow = styled.div`
  padding: 0.25rem 0;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #333;
  cursor: pointer;
`

const Checkbox = styled.input`
  cursor: pointer;
`

export default function Settings({ autoStart, onAutoStartChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Container>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
      >
        ⚙
      </ToggleButton>

      {isOpen && (
        <Panel>
          <Header>
            <Title>Settings</Title>
            <CloseButton onClick={() => setIsOpen(false)} aria-label="Close settings">
              ×
            </CloseButton>
          </Header>

          <SettingRow>
            <Label>
              <Checkbox
                type="checkbox"
                checked={autoStart}
                onChange={(e) => onAutoStartChange(e.target.checked)}
              />
              Auto-start next session
            </Label>
          </SettingRow>
        </Panel>
      )}
    </Container>
  )
}
