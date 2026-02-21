---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/TimerDisplay.tsx
autonomous: true

must_haves:
  truths:
    - Timer display takes up less vertical space
    - Timer text is proportionally sized
    - Components remain readable and accessible
  artifacts:
    - path: src/components/TimerDisplay.tsx
      provides: Compact timer display
      contains: Reduced padding and font size
---

<objective>
Reduce whitespace throughout the app by tightening the TimerDisplay component - the primary source of excess space.

Purpose: Make the UI feel more balanced and less sparse.
Output: Updated TimerDisplay with reduced padding and font sizes.
</objective>

<execution_context>
@/Users/dev/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/TimerDisplay.tsx
@src/components/ui/theme.ts
</context>

<tasks>

<task type="auto">
  <name>Reduce TimerDisplay padding and font size</name>
  <files>src/components/TimerDisplay.tsx</files>
  <action>
1. In DisplayContainer: Change padding from `3rem 4rem` to `1.5rem 2.5rem` (reduce vertical by 50%, horizontal by 37%)
2. In TimerText: Change font-size from `5rem` to `3.5rem` (reduce by 30%)
3. In TimerText: Reduce margin-bottom from `1rem` to `0.5rem`
4. In ModeBadge: Reduce margin-bottom from `1rem` to `0.5rem`
5. In DisplayContainer: Reduce min-width from `320px` to `280px`
  </action>
  <verify>npm run build 2>&1 | head -20</verify>
  <done>Timer display is more compact, takes up less vertical space while remaining readable</done>
</task>

</tasks>

<verification>
- Run the app and verify timer fits well in viewport
- Check that timer text is still clearly readable
- Verify all timer modes (focus/short break/long break) display correctly
</verification>

<success_criteria>
Timer display reduced from ~96px vertical padding to ~48px, font reduced from 80px to 56px.
</success_criteria>

<output>
After completion, create .planning/quick/5-overall-there-is-too-much-whitepsace-mak/5-SUMMARY.md
</output>
