import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { SessionRecord } from '../../types/session';
import { DateFilter, getDateRange } from '../../utils/dateUtils';
import { Stats, calculateStats } from '../../utils/statsUtils';

/**
 * Base Selectors
 *
 * These extract raw state values from the Redux store.
 */

// Select date filter from history state
export const selectDateFilter = (state: RootState): DateFilter => state.history.dateFilter;

// Select search query from history state
export const selectSearchQuery = (state: RootState): string => state.history.searchQuery;

// Select all sessions from history state
export const selectAllSessions = (state: RootState): SessionRecord[] => state.history.sessions;

// Select loading state from history state
export const selectIsLoading = (state: RootState): boolean => state.history.isLoading;

/**
 * Memoized Selectors
 *
 * These use createSelector for memoization. They only re-compute
 * when their input selectors return new values.
 */

// Select sessions filtered by date
// Input: [selectAllSessions, selectDateFilter]
// Output: SessionRecord[] filtered by date range
export const selectSessionsByDate = createSelector(
  [selectAllSessions, selectDateFilter],
  (sessions, dateFilter): SessionRecord[] => {
    if (dateFilter === 'all') {
      return sessions;
    }

    const range = getDateRange(dateFilter);
    if (!range) {
      return sessions;
    }

    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTimestamp);
      return sessionDate >= range.start && sessionDate <= range.end;
    });
  }
);

// Select sessions filtered by date AND search query
// Input: [selectSessionsByDate, selectSearchQuery]
// Output: SessionRecord[] filtered by both date and search
export const selectFilteredSessions = createSelector(
  [selectSessionsByDate, selectSearchQuery],
  (sessions, searchQuery): SessionRecord[] => {
    if (!searchQuery.trim()) {
      return sessions;
    }

    const searchLower = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      const noteMatches = session.noteText.toLowerCase().includes(searchLower);
      const tagMatches = session.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      return noteMatches || tagMatches;
    });
  }
);

// Select stats computed from sessions in date range
// Input: [selectSessionsByDate]
// Output: Stats object with today/7day/30day metrics
export const selectStats = createSelector(
  [selectSessionsByDate],
  (sessions): Stats => {
    return calculateStats(sessions);
  }
);

// Select longest session in the current date range
// Input: [selectSessionsByDate]
// Output: number - longest session duration in seconds, or 0 if empty
export const selectLongestSession = createSelector(
  [selectSessionsByDate],
  (sessions): number => {
    if (sessions.length === 0) {
      return 0;
    }
    return sessions.reduce(
      (max, session) => Math.max(max, session.actualDurationSeconds),
      0
    );
  }
);
