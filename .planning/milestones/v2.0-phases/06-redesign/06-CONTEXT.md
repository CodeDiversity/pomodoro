# Phase 6: redesign - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete visual redesign of the Pomodoro timer app transitioning from dark mode to a clean, modern light-mode aesthetic with blue accents. Includes new layout structure (sidebar navigation, split-pane timer view), circular timer with progress ring, card-based history, and refined typography. All existing functionality preserved.

</domain>

<decisions>
## Implementation Decisions

### Color Scheme
- **Switch to light mode**: White/light gray backgrounds instead of current dark mode
- **Blue accent color** (#0066FF or similar): Replace current red (#e74c3c) throughout
- **Blue primary button**: Circular timer controls, action buttons in blue
- **Status indicators**: Green checkmarks for completed sessions
- **Neutral grays**: For text hierarchy and borders

### Layout Structure
- **Sidebar navigation**: Left sidebar with icons + labels (Timer, History, Statistics, Settings)
- **Split-pane timer view**: Timer on left, Active Session notes panel on right (side by side)
- **History as full panel**: History view replaces the timer panel when selected
- **Responsive**: Sidebar collapses or adapts on smaller screens

### Timer Display
- **Circular progress ring**: Blue ring showing time remaining around the timer
- **Large typography**: Timer digits prominent (24:59 style)
- **Session status label**: "DEEP WORK" badge above timer
- **Bottom controls**: Play/pause in center (blue circle), skip/reset as icon buttons
- **Daily goal indicator**: "4/8 Sessions" with progress bar at bottom of timer panel

### Notes Panel (Active Session)
- **Task input**: "What are you working on?" at top
- **Formatting toolbar**: Bold, list, link buttons above textarea
- **Clean textarea**: White background, subtle border, placeholder text
- **Tags section**: Pills/chips for tags with "+ Add Tag" button
- **Pro Tip card**: Light blue background tip card below notes
- **Complete Session button**: Full-width dark button at bottom

### History View
- **Header stats**: "You've focused for 12.5 hours this week" with blue accent
- **Search bar**: Prominent search with icon
- **Filter + Calendar**: Search bar with Filter dropdown and calendar icon button
- **Date grouping**: "TODAY, OCT 24" style section headers
- **Session cards**: White cards with:
  - Status icon (green checkmark for completed)
  - Session title and time range
  - Duration badge
  - Tags as blue pills on right
  - Notes preview (truncated)
- **Load more**: "Load Older Sessions" with expand icon
- **FAB**: Blue circular floating action button (play icon) in bottom right

### Visual Style
- **Rounded corners**: 8-12px radius on cards, buttons, inputs
- **Subtle shadows**: Light shadows on cards and elevated elements
- **Card-based containers**: White cards on light gray background
- **Clean sans-serif typography**: Modern font stack, clear hierarchy
- **Icon style**: Lucide-style icons (clean, outlined)

### Navigation
- **Logo/brand**: "FocusTime" or "FocusFlow" in sidebar header
- **Active state**: Blue highlight or background on active nav item
- **Top bar**: Notification bell, settings icon, user avatar (for future use)

### Claude's Discretion
- Exact spacing values (follow mockup proportions)
- Shadow intensity and blur values
- Font weights and exact sizes
- Animation timing for transitions
- Hover state details
- Responsive breakpoint behavior

</decisions>

<specifics>
## Specific Ideas

- Mockup shows "FocusTime" branding — consider new app name or keep existing
- "FocusFlow" shown as alternative in history view header
- Session history shows 12.5 hours focused this week — consider weekly stats integration
- History items show rich preview with full notes content
- Tags are prominent pills with blue border/fill
- Pro Tip card suggests helpful usage tips
- Daily goal: 4/8 sessions with progress visualization
- Export Data button in history header (future feature)

</specifics>

<deferred>
## Deferred Ideas

- User authentication/avatars (shown in mockup but not v2.0 scope)
- Export Data functionality (button shown but feature not in scope)
- Multiple timer modes beyond Focus/Short Break/Long Break
- Collaboration or sharing features
- Mobile app version

</deferred>

---

*Phase: 06-redesign*
*Context gathered: 2026-02-21*
