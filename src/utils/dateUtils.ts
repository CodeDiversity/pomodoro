// Date formatting utilities

export type DateFilter = 'today' | '7days' | '30days' | 'all'

/**
 * Formats a date to full format: "02/19/2026 2:30 PM"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

/**
 * Formats a date to short format: "02/19/2026" (no time)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Returns date range for the given filter
 */
export function getDateRange(filter: DateFilter): { start: Date; end: Date } | null {
  if (filter === 'all') {
    return null
  }

  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const start = new Date(now)

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case '7days':
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      break
    case '30days':
      start.setDate(start.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      break
  }

  return { start, end }
}
