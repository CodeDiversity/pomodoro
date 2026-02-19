import { TimerMode } from '../types/timer'

/**
 * Browser notification service
 * Handles permission requests and sends notifications when sessions end
 */

// Track if permission has been requested
let permissionRequested = false

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

/**
 * Request notification permission from the user
 * Should be called on first user interaction (not on page load)
 * @returns The new permission status
 */
export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser notifications not supported')
    return 'unsupported'
  }

  // If already granted, return current status
  if (Notification.permission === 'granted') {
    return 'granted'
  }

  // If previously denied, can't request again
  if (Notification.permission === 'denied') {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    permissionRequested = true
    return permission
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return 'denied'
  }
}

/**
 * Check if we can send notifications
 */
export function canSendNotifications(): boolean {
  return getNotificationPermission() === 'granted'
}

/**
 * Get notification message based on completed session mode
 */
function getNotificationMessage(mode: TimerMode): { title: string; body: string } {
  switch (mode) {
    case 'focus':
      return {
        title: 'Pomodoro Timer',
        body: 'Focus session complete! Time for a break.',
      }
    case 'shortBreak':
      return {
        title: 'Pomodoro Timer',
        body: 'Break over! Ready to focus?',
      }
    case 'longBreak':
      return {
        title: 'Pomodoro Timer',
        body: 'Long break complete! Ready for another session?',
      }
    default:
      return {
        title: 'Pomodoro Timer',
        body: 'Session complete!',
      }
  }
}

/**
 * Show a browser notification for session completion
 * @param mode - The mode that just completed
 */
export function showNotification(mode: TimerMode): void {
  const permission = getNotificationPermission()

  // Check permission before sending
  if (permission !== 'granted') {
    console.warn('Notification permission not granted:', permission)
    return
  }

  const { title, body } = getNotificationMessage(mode)

  try {
    // Create and show the notification
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico', // Use existing favicon
      badge: '/favicon.ico',
      tag: 'pomodoro-session', // Prevent duplicates
      requireInteraction: false,
    })

    // Close after a few seconds if not interacted with
    setTimeout(() => {
      notification.close()
    }, 5000)

    // Handle click to focus the window
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

/**
 * Check if permission request has been made
 */
export function hasPermissionBeenRequested(): boolean {
  return permissionRequested
}

/**
 * Send both audio beep and notification
 * Called when a session ends
 * @param mode - The mode that just completed
 */
export async function notifySessionComplete(mode: TimerMode): Promise<void> {
  // Import dynamically to avoid circular dependencies
  const { playBeep } = await import('./audio')

  // Play audio beep
  await playBeep()

  // Show browser notification (if permitted)
  showNotification(mode)
}
