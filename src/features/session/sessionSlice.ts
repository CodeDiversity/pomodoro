import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * Session State Interface
 *
 * Manages the current session's notes and tags in Redux.
 * Used for the active timer session before it's saved to history.
 */
export interface SessionState {
  noteText: string
  tags: string[]
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSaved: number | null
}

const initialState: SessionState = {
  noteText: '',
  tags: [],
  saveStatus: 'idle',
  lastSaved: null,
}

/**
 * Session Slice
 *
 * Manages session notes and tags state with the following actions:
 * - setNoteText: Update note text and mark as needing to be saved
 * - setTags: Update tags and mark as needing to be saved
 * - setSaveStatus: Directly set the save status
 * - markSaved: Mark the session as saved with current timestamp
 * - resetSession: Reset all session state to initial values
 * - loadSession: Hydrate state from persisted storage
 */
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setNoteText(state, action: PayloadAction<string>) {
      state.noteText = action.payload
      state.saveStatus = 'saving'
    },
    setTags(state, action: PayloadAction<string[]>) {
      state.tags = action.payload
      state.saveStatus = 'saving'
    },
    setSaveStatus(state, action: PayloadAction<'idle' | 'saving' | 'saved'>) {
      state.saveStatus = action.payload
    },
    markSaved(state) {
      state.saveStatus = 'saved'
      state.lastSaved = Date.now()
    },
    resetSession(state) {
      state.noteText = ''
      state.tags = []
      state.saveStatus = 'idle'
      state.lastSaved = null
    },
    loadSession(state, action: PayloadAction<SessionState>) {
      state.noteText = action.payload.noteText
      state.tags = action.payload.tags
      state.saveStatus = 'saved'
      state.lastSaved = action.payload.lastSaved
    },
  },
})

export const {
  setNoteText,
  setTags,
  setSaveStatus,
  markSaved,
  resetSession,
  loadSession,
} = sessionSlice.actions

export default sessionSlice.reducer
