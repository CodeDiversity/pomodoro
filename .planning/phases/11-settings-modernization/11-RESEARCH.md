# Phase 11: Settings Modernization - Research

**Researched:** 2026-02-22
**Domain:** Settings page redesign, audio playback, React state management
**Confidence:** HIGH

## Summary

This phase requires modernizing the settings page from a modal overlay to a full-page view integrated into the main layout via sidebar navigation, plus adding custom notification sound selection with preview and volume controls. The codebase already has the basic infrastructure in place: sidebar navigation supports 'settings' as a view mode, the Settings component already has a `viewMode="page"` option, and there's an existing audio service using Web Audio API. The primary work involves redesigning the page view to match the design system, extending the persistence layer for sound settings, and creating a sound selection UI.

**Primary recommendation:** Extend the existing Settings component page view mode with a new "Sound" section, create a Redux slice for settings (or extend existing UI slice) to manage sound preferences, and enhance the audio service to support multiple sound types with volume control.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18 | UI framework | Already in use |
| TypeScript | - | Type safety | Already in use |
| styled-components | 6.x | Styling | Already in use, matches design system |
| Redux Toolkit | 2.x | State management | Already in use for UI/history slices |
| IndexedDB (via dexie) | - | Persistence | Already in use for settings/sessions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Audio API | Native | Sound generation/playback | Already in use (audio.ts) |
| Browser Notifications API | Native | Session completion alerts | Already in use (notifications.ts) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Redux for settings | React Context | Redux provides DevTools visibility and follows existing patterns |
| Web Audio API oscillators | Audio files (.mp3/.wav) | Oscillators work offline, no assets needed, simpler to customize |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   └── settings/           # NEW: Settings feature slice
│       ├── settingsSlice.ts
│       └── settingsSelectors.ts
├── components/
│   └── settings/
│       ├── SettingsPage.tsx   # Main settings page
│       ├── SoundSettings.tsx  # Sound selection component
│       └── DurationSettings.tsx
├── services/
│   ├── audio.ts            # Enhanced: multiple sounds + volume
│   └── persistence.ts      # Extended: sound settings
```

### Pattern 1: Settings Page as Full-Page View
**What:** Settings rendered as a page within the main content area, not a modal overlay
**When to use:** When viewMode === 'settings' in the UI slice
**Example:**
```typescript
// App.tsx already handles this:
{viewMode === 'settings' && (
  <Settings
    autoStart={autoStart}
    onAutoStartChange={setAutoStart}
    customDurations={customDurations || undefined}
    onSaveDurations={handleSaveDurations}
    viewMode="page"
  />
)}
```

### Pattern 2: Sound Selection with Preview
**What:** Dropdown to select sound type with a preview button that plays the selected sound
**When to use:** For notification sound customization
**Example:**
```typescript
// Sound option structure
interface SoundOption {
  id: string
  name: string
  type: 'beep' | 'chime' | 'bell' | 'digital'
}

// Preview button triggers audio playback
const handlePreview = (sound: SoundOption) => {
  playSound(sound.id, volume)
}
```

### Pattern 3: Volume Control Slider
**What:** Range input (0-100%) that controls audio gain
**When to use:** For volume customization
**Example:**
```typescript
const VolumeSlider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  accent-color: ${colors.primary};
`
```

### Pattern 4: Settings Persistence with Defaults
**What:** Extend AppSettings interface to include sound preferences with fallback to defaults
**When to use:** For persisting user preferences across sessions
**Example:**
```typescript
interface AppSettings {
  autoStart: boolean
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  // NEW:
  notificationSound: string
  volume: number
}
```

### Pattern 5: Redux Slice for Settings
**What:** Create a settings slice to manage sound preferences in Redux state
**When to use:** To provide Redux DevTools visibility and enable selective re-renders
**Example:**
```typescript
// features/settings/settingsSlice.ts
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    notificationSound: 'beep',
    volume: 80,
  },
  reducers: {
    setNotificationSound(state, action) {
      state.notificationSound = action.payload
    },
    setVolume(state, action) {
      state.volume = action.payload
    },
  },
})
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio playback | Custom audio player | Web Audio API | Already implemented, supports volume control natively |
| Settings persistence | localStorage | IndexedDB via persistence.ts | Follows existing pattern, structured storage |
| Sound generation | Load external audio files | Web Audio API oscillators | Works offline, no assets needed, fully customizable |

**Key insight:** The Web Audio API provides everything needed for sound playback with volume control through GainNode. Extending the existing audio.ts service is the most maintainable approach.

## Common Pitfalls

### Pitfall 1: AudioContext Not Resuming After User Interaction
**What goes wrong:** Browser blocks audio playback until user interacts with the page
**Why it happens:** Modern browsers suspend AudioContext for autoplay protection
**How to avoid:** Call `audioContext.resume()` on user interaction (button click)
**Warning signs:** "AudioContext was not allowed to start" warnings in console

### Pitfall 2: Volume Persistence Not Applied
**What goes wrong:** Volume setting is saved but not loaded/used when playing sounds
**Why it happens:** Missing connection between loaded settings and audio service
**How to avoid:** Pass volume to audio service when playing sounds, load settings on app init

### Pitfall 3: Settings Not Saved on Change
**What goes wrong:** User changes settings but they're lost on page refresh
**Why it happens:** Missing call to saveSettings after state update
**How to avoid:** Call saveSettings in the change handlers before updating local state

### Pitfall 4: Sound Preview Plays During Silent Mode
**What goes wrong:** Preview sound plays even when volume is set to 0
**Why it happens:** Not checking volume before playing
**How to avoid:** Show visual feedback instead when volume is 0, or always allow preview at a minimum volume

## Code Examples

### Enhanced Audio Service with Multiple Sounds
```typescript
// src/services/audio.ts - enhanced
export type SoundType = 'beep' | 'chime' | 'bell' | 'digital'

const SOUND_CONFIGS: Record<SoundType, { frequency: number; type: OscillatorType; duration: number }> = {
  beep: { frequency: 880, type: 'sine', duration: 0.2 },
  chime: { frequency: 523, type: 'sine', duration: 0.5 },
  bell: { frequency: 392, type: 'triangle', duration: 0.8 },
  digital: { frequency: 1200, type: 'square', duration: 0.15 },
}

export async function playSound(soundType: SoundType, volume: number = 80): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return

  await resumeAudioContext()

  const config = SOUND_CONFIGS[soundType]
  const normalizedVolume = volume / 100

  const oscillator = ctx.createOscillator()
  oscillator.type = config.type
  oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime)

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, ctx.currentTime + 0.01)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + config.duration)
}
```

### Sound Selection Component
```typescript
// SoundSelector.tsx
const SoundSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  font-size: 0.95rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`

const PreviewButton = styled.button`
  padding: 8px 16px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${radii.md};
  cursor: pointer;

  &:hover {
    background: ${colors.primaryHover};
  }
`

interface Props {
  value: string
  onChange: (value: string) => void
  volume: number
}

export function SoundSelector({ value, onChange, volume }: Props) {
  const handlePreview = () => {
    playSound(value as SoundType, volume)
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SoundSelect value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="beep">Classic Beep</option>
        <option value="chime">Gentle Chime</option>
        <option value="bell">Bell</option>
        <option value="digital">Digital</option>
      </SoundSelect>
      <PreviewButton onClick={handlePreview}>Preview</PreviewButton>
    </div>
  )
}
```

### Volume Slider Component
```typescript
// VolumeSlider.tsx
const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Slider = styled.input.attrs({ type: 'range' })`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${colors.border};
  accent-color: ${colors.primary};
`

const VolumeValue = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: ${colors.textMuted};
`

export function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <SliderContainer>
      <Slider
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <VolumeValue>{value}%</VolumeValue>
    </SliderContainer>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Settings as modal overlay | Settings as full page view | Current phase | Better UX, more screen real estate |
| Single beep sound | Multiple sound options with preview | Current phase | User customization |
| No volume control | Volume slider (0-100%) | Current phase | Accessibility, user preference |
| Local component state | Redux slice for settings | Current phase | DevTools visibility, consistency |

**Deprecated/outdated:**
- Modal-based settings: Being replaced with full-page view
- Single sound option: Being replaced with sound selection dropdown

## Open Questions

1. **Sound file vs. oscillator generation**
   - What we know: Current implementation uses Web Audio API oscillators
   - What's unclear: Whether users want to upload custom audio files
   - Recommendation: Start with oscillator-based sounds, add file upload as future enhancement if requested

2. **Sound playback on mobile**
   - What we know: Web Audio API has varying support on iOS Safari
   - What's unclear: Whether the current implementation works on all mobile browsers
   - Recommendation: Test on iOS Safari, may need user interaction trigger before playback

3. **Notification permission flow**
   - What we know: Browser notifications require permission
   - What's unclear: Should sound settings also handle notification permission request?
   - Recommendation: Keep notification permission separate, only handle sound preferences in this phase

## Sources

### Primary (HIGH confidence)
- Existing codebase: audio.ts - Web Audio API implementation patterns
- Existing codebase: Settings.tsx - Component structure and styled-components usage
- Existing codebase: persistence.ts - Settings storage patterns
- Existing codebase: uiSlice.ts - Redux slice patterns

### Secondary (MEDIUM confidence)
- Web Audio API specification - Audio playback with GainNode for volume control
- MDN Web Docs - AudioContext best practices

### Tertiary (LOW confidence)
- N/A - Sufficient information available from codebase analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing stack (React, TypeScript, styled-components, Redux Toolkit, IndexedDB)
- Architecture: HIGH - Follows established patterns from Phase 9/10 (slices, selectors, persistence)
- Pitfalls: HIGH - Known issues (AudioContext resume, persistence flow) identified from existing code

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days - stable domain)
