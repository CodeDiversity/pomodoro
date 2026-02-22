/**
 * Audio notification service using Web Audio API
 * Plays a pleasant beep when a session ends
 * Supports multiple sound types with volume control
 */

// Sound type definitions
export type SoundType = 'beep' | 'chime' | 'bell' | 'digital'

/**
 * Sound configuration for each sound type
 */
interface SoundConfig {
  frequency: number
  type: OscillatorType
  duration: number
}

/**
 * Configuration for each available sound type
 */
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  beep: {
    frequency: 880,
    type: 'sine',
    duration: 0.2,
  },
  chime: {
    frequency: 523,
    type: 'sine',
    duration: 0.5,
  },
  bell: {
    frequency: 392,
    type: 'triangle',
    duration: 0.8,
  },
  digital: {
    frequency: 1200,
    type: 'square',
    duration: 0.15,
  },
}
let audioContext: AudioContext | null = null

/**
 * Get or create the audio context
 * Handles both standard and webkit prefixes
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch (error) {
      console.error('Failed to create AudioContext:', error)
      return null
    }
  }

  return audioContext
}

/**
 * Resume audio context if suspended (required by some browsers)
 */
async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch (error) {
      console.error('Failed to resume AudioContext:', error)
    }
  }
}

/**
 * Play a sound with the specified type and volume
 * Uses Web Audio API with oscillator and gain node for envelope
 *
 * @param soundType - The type of sound to play (beep, chime, bell, digital)
 * @param volume - Volume level from 0-100 (default: 80)
 */
export async function playSound(soundType: SoundType, volume: number = 80): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) {
    console.warn('AudioContext not available')
    return
  }

  // Resume context if suspended (required after user interaction)
  await resumeAudioContext()

  try {
    // Get configuration for the requested sound type
    const config = SOUND_CONFIGS[soundType]

    // Normalize volume (0-100 -> 0-1)
    const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100

    // Create oscillator with config frequency and type
    const oscillator = ctx.createOscillator()
    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime)

    // Create gain node for volume control with envelope
    const gainNode = ctx.createGain()

    // Quick attack - rise to full volume in 10ms
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, ctx.currentTime + 0.01)

    // Sustain briefly, then decay - fade out
    const sustainEnd = ctx.currentTime + 0.01
    const endTime = ctx.currentTime + config.duration
    gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, sustainEnd)
    gainNode.gain.linearRampToValueAtTime(0, endTime)

    // Connect: oscillator -> gain -> destination
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play the sound
    oscillator.start(ctx.currentTime)
    oscillator.stop(endTime)

    // Clean up after playing
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch (error) {
    console.error(`Failed to play sound (${soundType}):`, error)
  }
}

/**
 * Play a pleasant beep sound using Web Audio API
 * Uses an oscillator with sine wave at 880Hz for 200ms
 * Creates a quick attack/decay envelope for a pleasant tone
 *
 * @deprecated Use playSound('beep', volume) instead for more flexibility
 */
export async function playBeep(): Promise<void> {
  // Delegate to playSound with default beep and volume
  await playSound('beep', 80)
}

/**
 * Check if audio is available (for feature detection)
 */
export function isAudioAvailable(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window
}
