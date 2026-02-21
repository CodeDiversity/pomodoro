import { configureStore } from '@reduxjs/toolkit';

/**
 * Redux Store Configuration
 *
 * This is the central Redux store for the Pomodoro Timer application.
 * Currently initialized with an empty reducer object - slices will be added
 * incrementally in subsequent phases:
 * - Phase 8: timerSlice
 * - Phase 9: uiSlice, sessionSlice
 * - Phase 10: historySlice
 * - Phase 11: settingsSlice
 */

export const store = configureStore({
  reducer: {},
  // Redux DevTools are enabled automatically in development by configureStore
  // No additional configuration needed for default DevTools setup
});

/**
 * RootState type - represents the complete state tree of the Redux store.
 * Used for type-safe selector functions throughout the application.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch type - represents the dispatch function type.
 * Used for type-safe dispatch operations in thunks and components.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Hot Module Replacement (HMR) support for Vite
 *
 * This enables the Redux store to hot-reload during development
 * without losing the current state. When store.ts is modified,
 * the new module is accepted and the store is updated in place.
 */
if (import.meta.hot) {
  import.meta.hot.accept();
}
