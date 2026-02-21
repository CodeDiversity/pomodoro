---
phase: quick
plan: 4
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/NotePanel.tsx
  - src/components/TagInput.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - Notes section has a Google Keep-like appearance
    - Visual card styling with subtle elevation and shadow
    - Clean header/label area for the notes section
  artifacts:
    - path: src/components/NotePanel.tsx
      provides: Modernized note-taking card with Google aesthetic
    - path: src/components/TagInput.tsx
      provides: Integrated tag input with clean styling
  key_links:
    - from: NotePanel
      to: TagInput
      via: Sequential rendering in App.tsx
---

<objective>
Give the notes section a Google-like feel (Google Keep aesthetic).

Purpose: Notes should feel like a modern, clean card similar to Google Keep - minimal, elevated, with clear visual hierarchy.

Output: Updated NotePanel and TagInput components with Google Keep styling.
</objective>

<execution_context>
@/Users/dev/.claude/get-shit-done/workflows/execute-plan.md
@/Users/dev/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/NotePanel.tsx
@src/components/TagInput.tsx
@src/components/ui/theme.ts
</context>

<tasks>

<task type="auto">
  <name>Modernize NotePanel with Google Keep aesthetic</name>
  <files>src/components/NotePanel.tsx</files>
  <action>
    Update NotePanel to have a Google Keep-like appearance:

    1. Add a header row with icon (lightbulb icon or note icon) and "Notes" label - positioned above textarea
    2. Increase panel elevation with stronger shadow (shadow-lg or custom)
    3. Remove visible border - rely on shadow for definition
    4. Increase border-radius to 16px for softer corners
    5. Add subtle background color (slightly off-white like Keep's cards)
    6. Make textarea placeholder more prominent with italic style
    7. Position character counter and save status more elegantly (maybe inline)
    8. Add subtle hover lift effect on the panel

    Reference Google Keep: White cards, subtle shadow, minimal borders, soft corners, icon header.
  </action>
  <verify>
    Run `npm run build` to verify no TypeScript errors, then visually verify the notes section has card-like appearance.
  </verify>
  <done>
    NotePanel renders with Google Keep aesthetic - visible header/label, elevated card shadow, soft corners, clean textarea area.
  </done>
</task>

<task type="auto">
  <name>Modernize TagInput to integrate visually with NotePanel</name>
  <files>src/components/TagInput.tsx</files>
  <action>
    Update TagInput to integrate seamlessly with the modernized NotePanel:

    1. Remove the outer Container border/shadow since it's now part of a card
    2. Add visual connection to NotePanel (shared visual container)
    3. Make tag chips slightly more subtle (less gradient, more flat Material style)
    4. Adjust spacing to flow naturally as part of the note card
    5. Keep existing functionality but style as integrated part of the note card
  </action>
  <verify>
    Run `npm run build` to verify no TypeScript errors.
  </verify>
  <done>
    TagInput visually integrates with NotePanel as a cohesive card component.
  </done>
</task>

</tasks>

<verification>
- [ ] Build passes without errors
- [ ] Notes section appears as cohesive card (header + textarea + tags)
- [ ] Visual style matches Google Keep aesthetic
</verification>

<success_criteria>
Notes section has Google Keep-like appearance with card styling, header area, clean shadows, and integrated tag input.
</success_criteria>

<output>
After completion, create `.planning/quick/4-the-notes-need-more-of-a-google-feel-to-/quick-04-SUMMARY.md`
</output>
