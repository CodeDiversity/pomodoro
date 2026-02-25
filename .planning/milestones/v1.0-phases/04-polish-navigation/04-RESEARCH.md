# Phase 4 Research: UI Polish & Navigation

## Current State

### Layout Issues
- App.tsx uses `minHeight: '100vh'` with `padding: 1rem`
- Navigation buttons at absolute position top-left
- Timer view has excessive vertical spacing (marginTop: 2rem between timer and controls)
- NotePanel and TagInput have `margin-top: 1rem` and `margin-top: 0.75rem`
- History/Stats views have `marginTop: '3rem'`

### Navigation Issues
- Current: Simple buttons with blue border/background for active state
- Missing: Proper tab bar with underline indicator or pill styling

### Styling Inconsistencies
- TimerControls: gray (#333) primary button
- TagInput chips: red (#e74c3c) background
- NotePanel: light gray (#fafafa) background
- StatCard: white with subtle shadow
- HelpPanel/Settings: white with border

## Polish Recommendations

### 1. Layout Consolidation
- Reduce overall padding from 1rem to 0.5rem
- Reduce margin between timer display and controls from 2rem to 1rem
- Group timer + controls + notes more tightly
- Use consistent gap spacing (0.5rem or 0.75rem)

### 2. Navigation Upgrade
- Replace buttons with proper tab bar at top
- Add active indicator (underline or pill background)
- Make tabs look like navigation tabs, not toggle buttons
- Consistent with modern UI patterns

### 3. Visual Refinement
- Unified color scheme (keep mode-specific colors for timer)
- Consistent border-radius (8px or 12px)
- Subtle shadows for depth
- Better contrast for text

### 4. Component Polish
- TimerDisplay: Already looks good, consider subtle refinements
- TimerControls: More prominent primary action
- NotePanel/TagInput: Tighter integration
- Stats/History: Consistent with overall design

## Implementation Approach

1. First: Tighten layout spacing in App.tsx
2. Second: Upgrade navigation to proper tabs
3. Third: Refine component styling for consistency
4. Fourth: Test and verify

## Files to Modify
- src/App.tsx (layout, navigation)
- src/components/TimerDisplay.tsx (minor tweaks)
- src/components/TimerControls.tsx (styling)
- src/components/NotePanel.tsx (spacing)
- src/components/TagInput.tsx (spacing)
