// Duration formatting utilities

/**
 * Formats duration in seconds to full words: "25 minutes", "1 hour 15 minutes", "2 hours"
 */
export function formatDurationFull(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) {
    if (minutes === 1) {
      return '1 minute'
    }
    return `${minutes} minutes`
  }

  if (minutes === 0) {
    if (hours === 1) {
      return '1 hour'
    }
    return `${hours} hours`
  }

  if (hours === 1) {
    if (minutes === 1) {
      return '1 hour 1 minute'
    }
    return `1 hour ${minutes} minutes`
  }

  return `${hours} hours ${minutes} minutes`
}

/**
 * Truncates text to maxLength with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}
