---
phase: quick
plan: 10
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/stats/CalendarHeatmap.tsx
  - src/features/stats/StatsView.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Users can identify the calendar as an Activity Calendar showing monthly session data"
    - "Users can identify the bar chart as Weekly Focus Time showing 7-day focus breakdown"
  artifacts:
    - path: "src/components/stats/CalendarHeatmap.tsx"
      provides: "Activity Calendar title above month navigation"
      min_lines: 5
    - path: "src/features/stats/StatsView.tsx"
      provides: "Weekly Focus Time title above bar chart date range"
      min_lines: 3
---

<objective>
Add clear labels/titles to the calendar and bar chart components so users immediately understand what each visualization represents.

Purpose: Improve UI clarity by labeling the monthly activity calendar and weekly focus time chart.
Output: Updated CalendarHeatmap and StatsView with descriptive titles.
</objective>

<execution_context>
@/Users/michaelrobert/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/stats/CalendarHeatmap.tsx
@src/components/stats/WeeklyChart.tsx
@src/features/stats/StatsView.tsx
</context>

<tasks>

<task type="auto">
  <name>Add title to CalendarHeatmap</name>
  <files>src/components/stats/CalendarHeatmap.tsx</files>
  <action>
    Add a section title above the MonthHeader in the CalendarHeatmap component. Use styled-components (existing pattern). Title should be "Activity Calendar" or "Monthly Activity" - pick one that matches the existing design. Make it visually distinct but secondary to the month display. The title explains what the calendar represents: color-coded activity/streak data.

    Example styling:
    - Font size: 14-16px, font-weight: 600, color: #1e293b (matching MonthTitle)
    - Placed above the existing MonthHeader, within HeatmapContainer
  </action>
  <verify>Visual check: Calendar section now has "Activity Calendar" title above the month navigation</verify>
  <done>CalendarHeatmap has clear title "Activity Calendar" that explains what the colored calendar represents</done>
</task>

<task type="auto">
  <name>Add title to WeeklyChart section</name>
  <files>src/features/stats/StatsView.tsx</files>
  <action>
    Add a section title above the existing date range title in the WeeklyChart container. The title should clearly indicate this is a "Weekly Focus Time" or "Focus Time (Last 7 Days)" chart. Place it above the existing date range div (currently at lines 76-88).

    Example styling:
    - Font size: 16px, font-weight: 600, color: #1e293b
    - Above the date range, matching card header style
  </action>
  <verify>Visual check: Weekly chart section now has "Weekly Focus Time" title above the date range</verify>
  <done>StatsView WeeklyChart section has clear title explaining what the bar chart represents</done>
</task>

</tasks>

<verification>
- [ ] CalendarHeatmap displays "Activity Calendar" title
- [ ] StatsView displays "Weekly Focus Time" title above the bar chart
- [ ] Both titles are visually distinct and clearly readable
- [ ] Build succeeds without errors
</verification>

<success_criteria>
Users can immediately understand what each visualization shows:
- Calendar = Activity Calendar (monthly view of sessions/streaks)
- Bar chart = Weekly Focus Time (7-day focus time breakdown)
</success_criteria>

<output>
After completion, create `.planning/quick/10-the-calendar-and-the-bar-chart-aren-t-cl/10-SUMMARY.md`
</output>
