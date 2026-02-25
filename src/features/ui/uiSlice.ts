import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * ViewMode type - represents the different views in the application
 */
export type ViewMode = 'timer' | 'history' | 'stats' | 'settings'

/**
 * UIState interface - represents the UI state managed by this slice
 */
export interface UIState {
  viewMode: ViewMode
  isDrawerOpen: boolean
  selectedSessionId: string | null
  showSummary: boolean
  showPrivacyPolicy: boolean
  showTermsOfUse: boolean
}

/**
 * Initial state for the UI slice
 */
const initialState: UIState = {
  viewMode: 'timer',
  isDrawerOpen: false,
  selectedSessionId: null,
  showSummary: false,
  showPrivacyPolicy: false,
  showTermsOfUse: false,
}

/**
 * UI Slice - Manages view navigation, drawer state, and modal visibility
 *
 * This slice centralizes UI state management following Phase 8 patterns.
 * Enables Redux DevTools visibility for UI state transitions.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Set the current view mode
     */
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload
    },

    /**
     * Open the history drawer with a selected session
     */
    openDrawer(state, action: PayloadAction<string>) {
      state.isDrawerOpen = true
      state.selectedSessionId = action.payload
    },

    /**
     * Close the history drawer
     */
    closeDrawer(state) {
      state.isDrawerOpen = false
      state.selectedSessionId = null
    },

    /**
     * Show the session summary modal
     */
    showSummaryModal(state) {
      state.showSummary = true
    },

    /**
     * Hide the session summary modal
     */
    hideSummaryModal(state) {
      state.showSummary = false
    },

    /**
     * Show the privacy policy modal
     */
    showPrivacyPolicyModal(state) {
      state.showPrivacyPolicy = true
    },

    /**
     * Hide the privacy policy modal
     */
    hidePrivacyPolicyModal(state) {
      state.showPrivacyPolicy = false
    },

    /**
     * Show the terms of use modal
     */
    showTermsOfUseModal(state) {
      state.showTermsOfUse = true
    },

    /**
     * Hide the terms of use modal
     */
    hideTermsOfUseModal(state) {
      state.showTermsOfUse = false
    },
  },
})

export const {
  setViewMode,
  openDrawer,
  closeDrawer,
  showSummaryModal,
  hideSummaryModal,
  showPrivacyPolicyModal,
  hidePrivacyPolicyModal,
  showTermsOfUseModal,
  hideTermsOfUseModal,
} = uiSlice.actions

export default uiSlice.reducer
