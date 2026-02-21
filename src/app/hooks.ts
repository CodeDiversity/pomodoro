import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed Redux Hooks
 *
 * These hooks provide full TypeScript type inference for the Redux store.
 * Use these throughout the application instead of the standard
 * useDispatch and useSelector hooks from react-redux.
 *
 * Pattern uses RTK 2.0+ .withTypes<>() syntax for proper type inference.
 */

/**
 * useAppDispatch - Typed version of useDispatch
 *
 * Usage:
 *   const dispatch = useAppDispatch();
 *   dispatch(someAction());
 *
 * Provides full type safety for dispatching actions and thunks.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * useAppSelector - Typed version of useSelector
 *
 * Usage:
 *   const value = useAppSelector(state => state.some.value);
 *
 * Provides full type safety for selecting values from the Redux store.
 * The state parameter is automatically typed as RootState.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
