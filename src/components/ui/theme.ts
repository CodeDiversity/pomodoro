/**
 * Design tokens for consistent styling across the application
 */

export const colors = {
  primary: '#e74c3c',
  primaryHover: '#c0392b',
  secondary: '#333333',
  background: '#ffffff',
  surface: '#fafafa',
  border: '#e0e0e0',
  text: '#333333',
  textMuted: '#666666',
  success: '#27ae60',
  error: '#e53e3e',
} as const;

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 2px 8px rgba(0,0,0,0.1)',
  lg: '0 4px 16px rgba(0,0,0,0.15)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const;

export const theme = {
  colors,
  radii,
  shadows,
  transitions,
  spacing,
} as const;

export type Theme = typeof theme;
