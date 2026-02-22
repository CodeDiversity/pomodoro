import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { setNotificationSound, setVolume } from '../../features/settings/settingsSlice'
import { playSound, SoundType } from '../../services/audio'
import styled from 'styled-components'
import { colors, transitions } from '../ui/theme'

// Sound type options
const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: 'beep', label: 'Beep' },
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell' },
  { value: 'digital', label: 'Digital' },
]

// Styled components matching the design system
const SectionContainer = styled.div`
  margin-bottom: 24px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Label = styled.label`
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
`

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SoundSelect = styled.select`
  flex: 1;
  padding: 10px 12px;
  font-size: 0.95rem;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background-color: white;
  color: #333;
  cursor: pointer;
  transition: all ${transitions.normal};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;

  &:hover {
    border-color: #D0D0D0;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }
`

const PreviewButton = styled.button`
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: ${colors.primary};
  color: white;
  transition: all ${transitions.normal};
  white-space: nowrap;

  &:hover {
    background-color: ${colors.primaryHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.primary};
  }

  &:active {
    transform: scale(0.98);
  }
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #E0E0E0;
  appearance: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform ${transitions.fast};
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }
`

const VolumeValue = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
`

/**
 * SoundSettings Component
 *
 * Provides UI for selecting notification sound and adjusting volume.
 * Uses Redux for state management via settingsSlice.
 */
export default function SoundSettings() {
  const dispatch = useAppDispatch()
  const { notificationSound, volume } = useAppSelector((state) => state.settings)

  const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setNotificationSound(e.target.value))
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVolume(Number(e.target.value)))
  }

  const handlePreview = async () => {
    await playSound(notificationSound as SoundType, volume)
  }

  return (
    <SectionContainer>
      <SectionTitle>Sound</SectionTitle>
      <SettingRow>
        <Label>
          <SelectContainer>
            <SoundSelect
              value={notificationSound}
              onChange={handleSoundChange}
              aria-label="Notification sound"
            >
              {SOUND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SoundSelect>
            <PreviewButton
              type="button"
              onClick={handlePreview}
              aria-label="Preview sound"
            >
              Preview
            </PreviewButton>
          </SelectContainer>
        </Label>

        <Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
            <VolumeValue>{volume}%</VolumeValue>
          </SliderContainer>
        </Label>
      </SettingRow>
    </SectionContainer>
  )
}
