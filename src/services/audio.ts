/**
 * Audio notification service using Web Audio API
 * Plays a pleasant beep when a session ends
 */

// Audio context singleton - lazily created
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
 * Play a pleasant beep sound using Web Audio API
 * Uses an oscillator with sine wave at 880Hz for 200ms
 * Creates a quick attack/decay envelope for a pleasant tone
 */
export async function playBeep(): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) {
    console.warn('AudioContext not available')
    return
  }

  // Resume context if suspended (required after user interaction)
  await resumeAudioContext()

  try {
    // Create oscillator for the tone
    const oscillator = ctx.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 note

    // Create gain node for envelope (attack/decay)
    const gainNode = ctx.createGain()

    // Quick attack - rise to full volume in 10ms
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)

    // Sustain briefly, then decay - fade out in 190ms
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

    // Connect: oscillator -> gain -> destination
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Play the beep
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)

    // Clean up after playing
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch (error) {
    console.error('Failed to play beep:', error)
  }
}

/**
 * Check if audio is available (for feature detection)
 */
export function isAudioAvailable(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window
}
