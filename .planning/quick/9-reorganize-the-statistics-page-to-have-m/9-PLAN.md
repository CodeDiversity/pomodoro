---
phase: quick
plan: 9
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/stats/StatsView.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Stats components display in a tiled grid layout instead of vertical stack"
    - "StreakDisplay and StatsGrid appear side by side on desktop"
    - "Responsive layout stacks vertically on mobile screens"
  artifacts:
    - path: src/features/stats/StatsView.tsx
      provides: "Tiled grid layout for stats components"
  key_links:
    - from: StatsView
      to: StreakDisplay
      via: "component import and rendering"
    - from: StatsView
      to: StatsGrid
      via: "component import and rendering"
---

<objective>
Reorganize the statistics page from vertical stack to tiled grid layout for better UX. The current layout stacks 4 full-width sections, making poor use of screen space.

Purpose: Improve visual organization and make better use of horizontal space
Output: Updated StatsView.tsx with grid layout
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
@/Users/michaelrobert/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/features/stats/StatsView.tsx
@src/components/stats/StreakDisplay.tsx
@src/components/stats/StatsGrid.tsx
@src/components/stats/CalendarHeatmap.tsx
@src/components/stats/WeeklyChart.tsx
</context>

<tasks>

<task type="auto">
  <name>Reorganize StatsView into tiled grid layout</name>
  <files>src/features/stats/StatsView.tsx</files>
  <action>
    Replace the vertical stack layout with a CSS Grid layout:

    1. Create a container with CSS Grid using:
       - `display: grid`
       - `grid-template-columns: 1fr 2fr` (StreakDisplay takes 1/3, StatsGrid takes 2/3)
       - `gap: 16px`

    2. Row 1: Place StreakDisplay and StatsGrid side by side

    3. Row 2: CalendarHeatmap full width (span 2 columns)

    4. Row 3: WeeklyChart full width (span 2 columns)

    5. Add responsive breakpoint at 768px:
       - `grid-template-columns: 1fr` (stack all vertically on mobile)

    Keep all existing inline styles for cards (background, borderRadius, padding, boxShadow) but apply them to grid items instead of wrapper divs.

    Reference: StatsGrid already has responsive behavior (@media max-width: 600px) - align breakpoint with that.
  </action>
  <verify>
    - Check StatsView.tsx renders without TypeScript errors
    - Verify grid layout uses CSS Grid properties
    - Ensure responsive breakpoint exists for mobile
  </verify>
  <done>
    Stats page displays in tiled grid: StreakDisplay + StatsGrid on row 1, CalendarHeatmap full width on row 2, WeeklyChart full width on row 3. Mobile shows vertical stack.
  </done>
</task>

</tasks>

<verification>
- Verify StatsView.tsx compiles without TypeScript errors
- Ensure no regression in existing component functionality
- Verify styled-components or CSS Grid is used for layout
</verification>

<success_criteria>
- Stats page has tiled layout instead of vertical stack
- StreakDisplay and StatsGrid appear side by side on desktop (min-width: 768px)
- Layout is responsive and stacks on mobile
- All existing functionality preserved
</success_criteria>

<output>
After completion, create .planning/quick/9-reorganize-the-statistics-page-to-have-m/9-SUMMARY.md
</output>
