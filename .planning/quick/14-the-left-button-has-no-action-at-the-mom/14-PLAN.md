---
phase: quick
plan: 14
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "Clicking the notification bell button opens a notifications panel"
    - "The notifications panel shows relevant notifications"
  artifacts:
    - path: "src/App.tsx"
      provides: "NotificationButton with onClick handler and NotificationsPanel component"
      min_lines: 50
  key_links:
    - from: "NotificationButton"
      to: "NotificationsPanel"
      via: "onClick handler"
      pattern: "setShowNotifications"
---

<objective>
Add action to the notification bell button in the top bar that currently has no onClick handler.

Purpose: The notification bell button in the top bar is displayed but does nothing when clicked. Users need a way to see notifications about their focus sessions, streaks, and achievements.

Output: Working notification button that opens a notifications panel.
</objective>

<context>
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/App.tsx (lines 97-120, 440-460)
@/Users/michaelrobert/Documents/GitHub/pomodoro/src/components/ui/theme.ts
</context>

<tasks>

<task type="auto">
  <name>Add notification panel functionality to top bar</name>
  <files>src/App.tsx</files>
  <action>
Add an onClick handler to the NotificationButton that toggles a notifications panel. Create a simple NotificationsPanel component that displays:
- Current streak count with motivational message
- Recent session completion notifications
- Any system notifications

Implementation steps:
1. Add showNotifications state (useState) near other state declarations
2. Add setShowNotifications toggle function
3. Add onClick to NotificationButton: onClick={() => setShowNotifications(!showNotifications)}
4. Create styled NotificationsPanel component with:
   - Position: absolute, top: 60px, right: 60px
   - Background: white, box-shadow, border-radius
   - Max-height: 300px, overflow-y: auto
   - Min-width: 280px
5. Render NotificationsPanel conditionally when showNotifications is true
6. Panel content: Show streak count, "Notifications" title, and sample notifications list
7. Add click-outside handler to close panel when clicking outside

Reference existing styled components patterns in App.tsx for consistent styling.
  </action>
  <verify>
Build succeeds with no TypeScript errors:
  npm run build

Manual verification:
  1. Run app and locate notification bell in top bar
  2. Click bell icon
  3. Verify panel appears with notifications content
  4. Click outside panel to close
  </verify>
  <done>
Notification bell button has working onClick that toggles a notifications panel. Panel displays streak info and notifications list.
  </done>
</task>

</tasks>

<verification>
Build succeeds and notification button is functional
</verification>

<success_criteria>
- NotificationButton has onClick handler
- Clicking bell opens/closes notifications panel
- Panel displays relevant content (streak, notifications)
- Build passes without errors
</success_criteria>

<output>
After completion, create `.planning/quick/14-the-left-button-has-no-action-at-the-mom/14-SUMMARY.md`
</output>
