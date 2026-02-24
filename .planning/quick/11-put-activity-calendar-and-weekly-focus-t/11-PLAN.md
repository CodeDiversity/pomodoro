---
phase: quick
plan: "11"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/stats/StatsView.tsx
autonomous: true
must_haves:
  truths:
    - "Activity calendar and weekly chart appear side by side on desktop"
    - "Layout stacks vertically on mobile (responsive behavior preserved)"
  artifacts:
    - path: src/features/stats/StatsView.tsx
      provides: Grid layout with calendar and chart side by side
  key_links:
    - from: StatsView.tsx
      to: CalendarHeatmap
      via: grid layout
---

<objective>
Put the activity calendar and weekly focus time chart side by side in the stats view.

Purpose: Improve visual layout by displaying calendar and chart in a 2-column row instead of stacked
Output: Modified StatsView.tsx with updated grid layout
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/features/stats/StatsView.tsx
@src/components/stats/CalendarHeatmap.tsx
@src/components/stats/WeeklyChart.tsx
</context>

<tasks>

<task type="auto">
  <name>Update StatsView grid layout for side-by-side</name>
  <files>src/features/stats/StatsView.tsx</files>
  <action>
    Modify the grid layout in StatsView.tsx:
    1. Change from 2-column grid to a layout where CalendarHeatmap and WeeklyChart are in the same row
    2. Currently: Row 2 is CalendarHeatmap (full width), Row 3 is WeeklyChart (full width)
    3. New layout: Row 2 should have CalendarHeatmap (left) and WeeklyChart (right) side by side
    4. Keep the 2:1 ratio for the side-by-side (e.g., CalendarHeatmap takes 1fr, WeeklyChart takes 1.5fr)
    5. Ensure responsive behavior still works - on mobile (<768px), stack vertically
  </action>
  <verify>
    Build succeeds with no errors: npm run build
  </verify>
  <done>
    CalendarHeatmap and WeeklyChart appear side by side in the stats view on desktop screens
  </done>
</task>

</tasks>

<verification>
- Build compiles without errors
- Layout displays correctly on desktop (side by side)
- Layout stacks on mobile (responsive preserved)
</verification>

<success_criteria>
- Activity calendar and weekly chart are displayed side by side on desktop
- Mobile responsive behavior maintained (stacks vertically)
- Build succeeds
</success_criteria>

<output>
After completion, create .planning/quick/11-put-activity-calendar-and-weekly-focus-t/11-SUMMARY.md
</output>
