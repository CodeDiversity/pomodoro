import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SessionRecord } from '../../types/session';
import { DateFilter } from '../../utils/dateUtils';
import { Stats } from '../../utils/statsUtils';
import { getAllSessions } from '../../services/sessionStore';
import { setDateFilter, setSearchQuery, loadSessions } from './historySlice';
import {
  selectFilteredSessions,
  selectAllSessions,
  selectDateFilter,
  selectSearchQuery,
  selectStats,
  selectLongestSession,
  selectIsLoading,
} from './historySelectors';

/**
 * UseSessionHistoryReturn Interface
 *
 * This defines the return type of the useSessionHistory hook.
 * Maintained for backward compatibility with the original hook API.
 */
export interface UseSessionHistoryReturn {
  sessions: SessionRecord[]
  filteredSessions: SessionRecord[]
  dateFilter: DateFilter
  searchQuery: string
  setDateFilter: (filter: DateFilter) => void
  setSearchQuery: (query: string) => void
  isLoading: boolean
  refetch: () => Promise<void>
  stats: Stats
  longestSessionInRange: number
}

/**
 * useSessionHistory Hook
 *
 * This hook provides session history data from Redux store with filtering capabilities.
 * It maintains the same API as the original useSessionHistory hook for backward compatibility.
 *
 * Features:
 * - Loads sessions from IndexedDB on mount
 * - Filters sessions by date range (today/7days/30days/all)
 * - Filters sessions by search query (notes and tags)
 * - Computes stats via memoized selectors
 * - Uses 200ms debounce for search queries
 */
export function useSessionHistory(): UseSessionHistoryReturn {
  const dispatch = useAppDispatch();

  // Selectors for state from Redux store
  const allSessions = useAppSelector(selectAllSessions);
  const filteredSessions = useAppSelector(selectFilteredSessions);
  const dateFilter = useAppSelector(selectDateFilter);
  const searchQuery = useAppSelector(selectSearchQuery);
  const stats = useAppSelector(selectStats);
  const longestSessionInRange = useAppSelector(selectLongestSession);
  const isLoading = useAppSelector(selectIsLoading);

  // Fetch sessions from IndexedDB and load into Redux
  const fetchSessions = useCallback(async () => {
    try {
      const data = await getAllSessions();
      // Sort by date descending (newest first)
      data.sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime());
      dispatch(loadSessions(data));
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      // Still mark loading as complete even on error
      dispatch(loadSessions([]));
    }
  }, [dispatch]);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Set date filter handler - wrapped in useCallback for stable reference
  const handleSetDateFilter = useCallback(
    (filter: DateFilter) => {
      dispatch(setDateFilter(filter));
    },
    [dispatch]
  );

  // Set search query handler - wrapped in useCallback for stable reference
  // Note: We still debounce in the component for search input to avoid rapid dispatches
  const handleSetSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  return {
    sessions: allSessions,
    filteredSessions,
    dateFilter,
    searchQuery,
    setDateFilter: handleSetDateFilter,
    setSearchQuery: handleSetSearchQuery,
    isLoading,
    refetch: fetchSessions,
    stats,
    longestSessionInRange,
  };
}
