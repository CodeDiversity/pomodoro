import { useState, useEffect, useCallback } from 'react'
import { SessionRecord } from '../types/session'
import { getAllSessions } from '../services/sessionStore'
import { DateFilter, getDateRange } from '../utils/dateUtils'

export interface SessionFilters {
  dateFilter: DateFilter
  searchQuery: string
}

interface UseSessionHistoryReturn {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  dateFilter: DateFilter
  searchQuery: string
  setDateFilter: (filter: DateFilter) => void
  setSearchQuery: (query: string) => void
  isLoading: boolean
  refetch: () => Promise<void>
}

export function useSessionHistory(): UseSessionHistoryReturn {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [filteredSessions, setFilteredSessions] = useState<SessionRecord[]>([])
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Fetch sessions from IndexedDB
  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllSessions()
      // Sort by date descending (newest first) - should already be from index
      data.sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime())
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter sessions combining date filter AND search (AND logic)
  useEffect(() => {
    let result = [...sessions]

    // Apply date filter
    if (dateFilter !== 'all') {
      const range = getDateRange(dateFilter)
      if (range) {
        result = result.filter((session) => {
          const sessionDate = new Date(session.startTimestamp)
          return sessionDate >= range.start && sessionDate <= range.end
        })
      }
    }

    // Apply search filter (searches notes and tags, case-insensitive)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter((session) => {
        const noteMatches = session.noteText.toLowerCase().includes(searchLower)
        const tagMatches = session.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        return noteMatches || tagMatches
      })
    }

    setFilteredSessions(result)
  }, [sessions, dateFilter, debouncedSearch])

  return {
    sessions,
    filteredSessions,
    dateFilter,
    searchQuery,
    setDateFilter,
    setSearchQuery,
    isLoading,
    refetch: fetchSessions,
  }
}
