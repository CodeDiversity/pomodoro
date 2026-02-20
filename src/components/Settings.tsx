import { useState, useEffect } from 'react'
import styled from 'styled-components'

interface SettingsProps {
  autoStart: boolean
  onAutoStartChange: (value: boolean) => void
  customDurations?: { focus: number; shortBreak: number; longBreak: number }
  onSaveDurations?: (durations: { focus: number; shortBreak: number; longBreak: number }) => void
}

// DurationInput component with +/- stepper
interface DurationInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
}

const DurationInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`

const DurationLabel = styled.span`
  font-size: 0.8125rem;
  color: #333;
  min-width: 70px;
`

const StepperButton = styled.button`
  width: 24px;
  height: 24px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background-color: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background-color: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const DurationNumberInput = styled.input`
  width: 50px;
  height: 24px;
  text-align: center;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 0.8125rem;
  padding: 0;

  &:focus {
    outline: none;
    border-color: #666;
  }
`

const DurationUnit = styled.span`
  font-size: 0.75rem;
  color: #666;
`

function DurationInput({ label, value, onChange, min, max }: DurationInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <DurationInputContainer>
      <DurationLabel>{label}</DurationLabel>
      <StepperButton
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        -
      </StepperButton>
      <DurationNumberInput
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        aria-label={`${label} duration`}
      />
      <StepperButton
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </StepperButton>
      <DurationUnit>min</DurationUnit>
    </DurationInputContainer>
  )
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

const DurationSection = styled.div`
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
`

const ErrorText = styled.div`
  font-size: 0.6875rem;
  color: #e53e3e;
  margin-top: 0.125rem;
  margin-left: 70px;
`

const SaveButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #4a5568;
  border-radius: 4px;
  background-color: #4a5568;
  color: white;
  margin-top: 0.5rem;

  &:hover {
    background-color: #2d3748;
  }
`

export default function Settings({ autoStart, onAutoStartChange, customDurations, onSaveDurations }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Initialize duration state from props (convert seconds to minutes)
  const [focusMinutes, setFocusMinutes] = useState(() => {
    return customDurations ? Math.round(customDurations.focus / 60) : 25
  })
  const [shortBreakMinutes, setShortBreakMinutes] = useState(() => {
    return customDurations ? Math.round(customDurations.shortBreak / 60) : 5
  })
  const [longBreakMinutes, setLongBreakMinutes] = useState(() => {
    return customDurations ? Math.round(customDurations.longBreak / 60) : 15
  })

  // Update local state when customDurations prop changes
  useEffect(() => {
    if (customDurations) {
      setFocusMinutes(Math.round(customDurations.focus / 60))
      setShortBreakMinutes(Math.round(customDurations.shortBreak / 60))
      setLongBreakMinutes(Math.round(customDurations.longBreak / 60))
    }
  }, [customDurations])

  const handleSaveDurations = () => {
    if (onSaveDurations) {
      onSaveDurations({
        focus: focusMinutes * 60,
        shortBreak: shortBreakMinutes * 60,
        longBreak: longBreakMinutes * 60,
      })
    }
  }

  // Validation functions
  const validateFocus = () => {
    if (focusMinutes < 1 || focusMinutes > 60) {
      return 'Must be between 1 and 60 minutes'
    }
    return null
  }

  const validateShortBreak = () => {
    if (shortBreakMinutes < 1 || shortBreakMinutes > 30) {
      return 'Must be between 1 and 30 minutes'
    }
    return null
  }

  const validateLongBreak = () => {
    if (longBreakMinutes < 1 || longBreakMinutes > 60) {
      return 'Must be between 1 and 60 minutes'
    }
    return null
  }

  const focusError = validateFocus()
  const shortBreakError = validateShortBreak()
  const longBreakError = validateLongBreak()

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

          {onSaveDurations && (
            <DurationSection>
              <DurationInput
                label="Focus"
                value={focusMinutes}
                onChange={setFocusMinutes}
                min={1}
                max={60}
              />
              {focusError && <ErrorText>{focusError}</ErrorText>}

              <DurationInput
                label="Short Break"
                value={shortBreakMinutes}
                onChange={setShortBreakMinutes}
                min={1}
                max={30}
              />
              {shortBreakError && <ErrorText>{shortBreakError}</ErrorText>}

              <DurationInput
                label="Long Break"
                value={longBreakMinutes}
                onChange={setLongBreakMinutes}
                min={1}
                max={60}
              />
              {longBreakError && <ErrorText>{longBreakError}</ErrorText>}

              <SaveButton
                onClick={handleSaveDurations}
                disabled={!!focusError || !!shortBreakError || !!longBreakError}
              >
                Save
              </SaveButton>
            </DurationSection>
          )}
        </Panel>
      )}
    </Container>
  )
}
