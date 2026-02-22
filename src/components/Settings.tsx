import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { clearDatabase } from '../services/db'
import { colors, transitions } from './ui/theme'
import SoundSettings from './settings/SoundSettings'

interface SettingsProps {
  autoStart: boolean
  onAutoStartChange: (value: boolean) => void
  customDurations?: { focus: number; shortBreak: number; longBreak: number }
  onSaveDurations?: (durations: { focus: number; shortBreak: number; longBreak: number }) => void
  viewMode?: 'modal' | 'page'
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
  font-size: 0.9rem;
  color: #333;
  min-width: 90px;
  font-weight: 500;
`

const StepperButton = styled.button`
  width: 32px;
  height: 32px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background-color: white;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: #F5F5F5;
    border-color: #D0D0D0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
    border-color: ${colors.primary};
  }
`

const DurationNumberInput = styled.input`
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 0.9rem;
  padding: 0;
  transition: all ${transitions.normal};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }

  /* Hide number spinner arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`

const DurationUnit = styled.span`
  font-size: 0.85rem;
  color: #888;
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

// Page container for settings view
const PageContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  width: 100%;
  padding: 32px;
  margin: auto;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E8E8E8;
`

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
`

const PageSubtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 8px 0 0;
`

const Container = styled.div`
  position: relative;
`

const ToggleButton = styled.button`
  width: 40px;
  height: 40px;
  font-size: 1rem;
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
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

// Modal header
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #E8E8E8;
`

const Title = styled.h2`
  font-size: 1.25rem;
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

// Modal content
const Content = styled.div`
  padding: 24px;
`

const SectionTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px 0;
`

const SettingRow = styled.div`
  margin-bottom: 24px;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
`

// Custom toggle switch
const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  background: ${props => props.checked ? colors.primary : '#E0E0E0'};
  border-radius: 12px;
  transition: background ${transitions.normal};
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: left ${transitions.normal};
  }
`

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

const DurationSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E8E8E8;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const ErrorText = styled.div`
  font-size: 0.75rem;
  color: ${colors.error};
  margin-top: 0.25rem;
  margin-left: 90px;
`

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background-color: transparent;
  color: #666;
  transition: all ${transitions.normal};

  &:hover {
    background-color: #F5F5F5;
    border-color: #D0D0D0;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }
`

const SaveButton = styled.button`
  flex: 1;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: ${colors.primary};
  color: white;
  transition: all ${transitions.normal};

  &:hover:not(:disabled) {
    background-color: ${colors.primaryHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ResetButton = styled.button`
  width: 100%;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${colors.error};
  border-radius: 8px;
  background-color: transparent;
  color: ${colors.error};
  transition: all ${transitions.normal};
  margin-top: 8px;

  &:hover {
    background-color: #fff5f5;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.error};
  }
`

const Toast = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$visible ? '0' : '20px'});
  opacity: ${props => props.$visible ? '1' : '0'};
  background: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function Settings({ autoStart, onAutoStartChange, customDurations, onSaveDurations, viewMode = 'modal' }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

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

  const handleSaveDurationsWrapper = () => {
    if (onSaveDurations) {
      onSaveDurations({
        focus: focusMinutes * 60,
        shortBreak: shortBreakMinutes * 60,
        longBreak: longBreakMinutes * 60,
      })
      // Show success toast
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }
    if (viewMode === 'modal') {
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (customDurations) {
      setFocusMinutes(Math.round(customDurations.focus / 60))
      setShortBreakMinutes(Math.round(customDurations.shortBreak / 60))
      setLongBreakMinutes(Math.round(customDurations.longBreak / 60))
    }
    setIsOpen(false)
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

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  // Page view mode: render as standalone page content
  if (viewMode === 'page') {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Settings</PageTitle>
          <PageSubtitle>Customize your timer preferences and manage your data</PageSubtitle>
        </PageHeader>

        <SectionTitle>Timer</SectionTitle>
        <SettingRow>
          <Label onClick={() => onAutoStartChange(!autoStart)}>
            <ToggleSwitch
              checked={autoStart}
              role="switch"
              aria-checked={autoStart}
            >
              <HiddenCheckbox
                type="checkbox"
                checked={autoStart}
                onChange={(e) => e.stopPropagation()}
              />
            </ToggleSwitch>
            Auto-start next session
          </Label>
        </SettingRow>

        {onSaveDurations && (
          <DurationSection>
            <SectionTitle>Durations</SectionTitle>
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
          </DurationSection>
        )}

        <SoundSettings />

        <SectionTitle>Data</SectionTitle>
        <ResetButton onClick={handleReset}>
          Reset All Data
        </ResetButton>

        {onSaveDurations && (
          <Footer style={{ marginTop: '24px', padding: '16px 0 0' }}>
            <SaveButton
              onClick={handleSaveDurationsWrapper}
              disabled={!!focusError || !!shortBreakError || !!longBreakError}
              style={{ minWidth: '120px' }}
            >
              Save Changes
            </SaveButton>
          </Footer>
        )}

        <Toast $visible={showToast}>
          <CheckIcon />
          Settings saved successfully
        </Toast>
      </PageContainer>
    )
  }

  // Modal view mode: render as button + modal overlay
  return (
    <Container>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close settings' : 'Open settings'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </ToggleButton>

      {isOpen && (
        <Overlay onClick={handleOverlayClick}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Header>
              <Title>Settings</Title>
              <CloseButton onClick={handleCancel} aria-label="Close settings">
                ×
              </CloseButton>
            </Header>

            <Content>
              <SectionTitle>Timer</SectionTitle>
              <SettingRow>
                <Label onClick={() => onAutoStartChange(!autoStart)}>
                  <ToggleSwitch
                    checked={autoStart}
                    role="switch"
                    aria-checked={autoStart}
                  >
                    <HiddenCheckbox
                      type="checkbox"
                      checked={autoStart}
                      onChange={(e) => e.stopPropagation()}
                    />
                  </ToggleSwitch>
                  Auto-start next session
                </Label>
              </SettingRow>

              {onSaveDurations && (
                <DurationSection>
                  <SectionTitle>Durations</SectionTitle>
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
                </DurationSection>
              )}

              <SectionTitle>Data</SectionTitle>
              <ResetButton onClick={handleReset}>
                Reset All Data
              </ResetButton>
            </Content>

            {onSaveDurations && (
              <Footer>
                <CancelButton onClick={handleCancel}>
                  Cancel
                </CancelButton>
                <SaveButton
                  onClick={handleSaveDurationsWrapper}
                  disabled={!!focusError || !!shortBreakError || !!longBreakError}
                >
                  Save Changes
                </SaveButton>
              </Footer>
            )}
          </Modal>
        </Overlay>
      )}

      <Toast $visible={showToast}>
        <CheckIcon />
        Settings saved successfully
      </Toast>
    </Container>
  )
}
