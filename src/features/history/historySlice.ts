import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DateFilter } from '../../utils/dateUtils';
import { SessionRecord } from '../../types/session';

/**
 * HistoryState Interface
 *
 * Manages history filter state and loaded sessions in Redux.
 * Used for filtering and displaying session history.
 */
export interface HistoryState {
  dateFilter: DateFilter
  searchQuery: string
  sessions: SessionRecord[]
  isLoading: boolean
}

const initialState: HistoryState = {
  dateFilter: 'all',
  searchQuery: '',
  sessions: [],
  isLoading: true,
}

/**
 * History Slice
 *
 * Manages history filter state with the following actions:
 * - setDateFilter: Update date range filter (today/7days/30days/all)
 * - setSearchQuery: Update search query for filtering sessions
 * - resetFilters: Reset dateFilter and searchQuery to defaults
 * - loadSessions: Set sessions array and mark loading complete
 */
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setDateFilter(state, action: PayloadAction<DateFilter>) {
      state.dateFilter = action.payload
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload
    },
    resetFilters(state) {
      state.dateFilter = 'all'
      state.searchQuery = ''
    },
    loadSessions(state, action: PayloadAction<SessionRecord[]>) {
      state.sessions = action.payload
      state.isLoading = false
    },
  },
})

export const {
  setDateFilter,
  setSearchQuery,
  resetFilters,
  loadSessions,
} = historySlice.actions

export default historySlice.reducer
