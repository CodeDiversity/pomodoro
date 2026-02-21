import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { clearDatabase } from '../services/db'
import { colors, radii, shadows, transitions } from './ui/theme'

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
  color: ${colors.text};
  min-width: 70px;
`

const StepperButton = styled.button`
  width: 28px;
  height: 28px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  background-color: ${colors.background};
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: ${colors.surface};
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const DurationNumberInput = styled.input`
  width: 50px;
  height: 28px;
  text-align: center;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  font-size: 0.8125rem;
  padding: 0;
  transition: all ${transitions.normal};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary}40;
  }
`

const DurationUnit = styled.span`
  font-size: 0.75rem;
  color: ${colors.textMuted};
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
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
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
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
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

const SettingRow = styled.div`
  padding: 0.25rem 0;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: ${colors.text};
  cursor: pointer;
`

const Checkbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const DurationSection = styled.div`
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${colors.surface};
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
  border: 1px solid ${colors.primary};
  border-radius: ${radii.md};
  background-color: ${colors.primary};
  color: white;
  margin-top: 0.5rem;
  transition: all ${transitions.normal};

  &:hover {
    background-color: ${colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: ${shadows.md};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const ResetButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${colors.error};
  border-radius: ${radii.md};
  background-color: ${colors.background};
  color: ${colors.error};
  margin-top: 0.5rem;
  transition: all ${transitions.normal};

  &:hover {
    background-color: #fff5f5;
    transform: translateY(-1px);
    box-shadow: ${shadows.sm};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.error};
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

  // Handle database reset
  const handleReset = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all data? This will delete all your sessions and settings.')
    if (confirmed) {
      await clearDatabase()
      window.location.reload()
    }
  }

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

          <ResetButton onClick={handleReset}>
            Reset All Data
          </ResetButton>
        </Panel>
      )}
    </Container>
  )
}
