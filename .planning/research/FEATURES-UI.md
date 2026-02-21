# Feature Research: Google Keep/Calendar UI Aesthetic for Pomodoro Redesign

**Domain:** UI/UX Design System
**Researched:** 2026-02-21
**Confidence:** MEDIUM

*Note: This research focuses on the visual design language (UI/UX patterns) rather than functional features. The goal is understanding what makes apps feel "Google" to apply to the Pomodoro app redesign.*

## Visual Design Elements Landscape

### Essential UI Components (Table Stakes)

These are the core visual elements that define the Google aesthetic. Missing any one makes the design feel incomplete or non-Google.

| Element | Why Essential | Complexity | Implementation Notes |
|---------|---------------|------------|----------------------|
| **Material Design 3 Foundation** | The underlying design system all Google apps use | HIGH | Requires M3 theming system, CSS custom properties for colors, typography, elevation |
| **Card-Based Layout** | Core pattern in Keep/Calendar - content in contained cards | LOW | Use elevated cards with rounded corners (12-16px radius) |
| **Rounded Corners (12-16px)** | Soft, approachable feel - hallmark of Google design | LOW | Apply consistently: buttons, cards, inputs, modals |
| **Soft Layered Shadows** | Creates depth and hierarchy without harshness | LOW | M3 elevation-1: layered shadows with opacity variations |
| **State Layer Interactions** | Subtle opacity transitions for hover/pressed states (15%/20%) | LOW | Hover: 15% opacity overlay, Pressed: 20% |
| **Google Sans Typography** | Official Google typeface, creates authentic look | MEDIUM | Use Roboto as fallback; Google Sans Text for body, Google Sans for display |
| **Material Icons** | Official Google icon set, rounded style matches M3 | LOW | Include Material Icons font, use outlined variants |
| **Surface Tinting** | Subtle color overlays on surfaces in M3 | MEDIUM | Apply surface tint using primary color at low opacity |
| **Clean White/Light Background** | Default for Keep/Calendar, creates breathing room | LOW | Use surface colors: #fff to #e8e1e3 |
| **Minimal Header/Navigation** | Unobtrusive, doesn't compete with content | LOW | Keep headers simple, minimal chrome |

### Differentiating Visual Elements

These elevate the design from "generic Material" to specifically Google Keep/Calendar.

| Element | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Note-Inspired Card Colors** | Keep's iconic yellow, other pastel tones for different note types | LOW | Yellow (#fff9c4), Blue (#bbdefb), Green (#c8e6c9), Pink (#f8bbd9), White |
| **Quick Action Bar** | Keep-style bottom action bar on cards (archive, delete, color) | LOW | Icons with text labels, appears on hover/focus |
| **Calendar Event Chips** | Rounded pill-shaped event indicators with color coding | LOW | Use colored left border or full background with rounded ends |
| **Floating Action Button (FAB)** | Primary action button - expandable in Keep | LOW | Bottom-right positioning, primary color, plus icon |
| **Outlined Text Fields** | M3 style input with underline animation | LOW | Filled (default) vs outlined variants |
| **Modal Bottom Sheets** | Keep-style note editing, Calendar event details | LOW | Slides up from bottom, draggable, rounded top corners |
| **Dynamic Color (Material You)** | User-generated palette from wallpaper - personalization | HIGH | Extract colors from wallpaper, apply to app theme |
| **Collapsible Sections** | Calendar's expandable month/week/day views | MEDIUM | Smooth animation, clear visual hierarchy |

### Anti-Patterns (What to Avoid)

These are common mistakes that undermine the Google aesthetic.

| Pattern | Why It Seems Good | Why Problematic | Alternative |
|---------|-------------------|-----------------|-------------|
| **Sharp Square Corners** | Seems modern/minimal | Feels harsh, dated, not Google | Use 12-16px radius consistently |
| **Heavy Dark Borders** | Creates contrast | Looks dated, competes with content | Use elevation/shadows instead |
| **Flat Design (No Shadows)** | Trendy a few years ago | Lacks depth, no hierarchy | Layered M3 shadows |
| **Generic Blue Primary Color** | Safe choice | Not Google; use dynamic or brand-appropriate purple | M3 primary: #6442d6 |
| **Thick/Cartoonish Icons** | More visible | Not Google style | Material Icons (outlined, 24px) |
| **Dense Information Layout** | More content visible | Feels cluttered, not Google | Generous whitespace, card-based separation |
| **Abrupt Hover Transitions** | Fast feedback | Feels jarring | Smooth 150-200ms opacity transitions |

## Design System Implementation Dependencies

```
[Material Design 3 Foundation]
    ├──requires──> [CSS Custom Properties (Design Tokens)]
    │                   ├──requires──> [Color System]
    │                   ├──requires──> [Typography Scale]
    │                   └──requires──> [Elevation Values]
    │
    ├──requires──> [Material Icons Font]
    │
    └──requires──> [Component Library]
                        ├──requires──> [Card Component]
                        ├──requires──> [Button Components (FAB, Text, Outlined)]
                        ├──requires──> [Input Fields]
                        └──requires──> [Navigation Components]

[Dynamic Color System]
    └──enhances──> [Material Design 3 Foundation]

[Google Keep-Specific Elements]
    ├──requires──> [Material Design 3 Foundation]
    └──enhances──> [Note Card Colors]

[Google Calendar-Specific Elements]
    ├──requires──> [Material Design 3 Foundation]
    └──enhances──> [Event Chip Components]
```

## Dependency Notes

- **M3 Foundation requires Design Tokens:** The entire system depends on CSS custom properties for colors, typography, and elevation - build these first
- **Material Icons must be loaded:** Without the icon font, the design won't feel authentic
- **Card component is foundational:** Both Keep and Calendar use cards extensively - this is the core container
- **State layers are essential:** M3 interaction patterns require hover/pressed state implementations
- **Dynamic Color enhances but not required:** Material You personalization is nice-to-have, not essential for the aesthetic

## MVP Definition for Redesign

### Launch With (v2.0)

Essential visual elements for the Google aesthetic - non-negotiable.

- [x] Material Design 3 foundation with design tokens (colors, typography, elevation)
- [x] Card-based layout with rounded corners (12-16px)
- [x] Soft layered shadows for elevation
- [x] Material Icons (outlined variants)
- [x] State layer interactions (hover/pressed states)
- [x] Clean white/light background
- [x] Floating Action Button for primary timer action
- [x] Rounded button styles throughout

### Add After Core (v2.x)

These complete the Google feel.

- [ ] Note-inspired card colors (yellow, pastel tones for notes)
- [ ] Quick action bars on cards
- [ ] Modal bottom sheets for editing
- [ ] Calendar-style event chips for history items
- [ ] Floating Action Button with expandable actions
- [ ] Collapsible/expandable sections

### Future Consideration (v3.0)

Advanced personalization.

- [ ] Dynamic Color (Material You) - extract colors from wallpaper
- [ ] Dark mode with M3 dark theme tokens

## Feature Prioritization Matrix

| Design Element | User Impact | Implementation Cost | Priority |
|----------------|-------------|---------------------|----------|
| Rounded Corners (12-16px) | HIGH | LOW | P1 |
| Soft Layered Shadows | HIGH | LOW | P1 |
| Card-Based Layout | HIGH | LOW | P1 |
| Material Icons | HIGH | LOW | P1 |
| State Layer Interactions | MEDIUM | LOW | P1 |
| Typography (Google Sans) | HIGH | MEDIUM | P1 |
| FAB (Floating Action Button) | MEDIUM | LOW | P1 |
| Note Card Colors | MEDIUM | LOW | P2 |
| Quick Action Bars | MEDIUM | LOW | P2 |
| Modal Bottom Sheets | MEDIUM | MEDIUM | P2 |
| Event Chips | LOW | LOW | P3 |
| Dynamic Color | MEDIUM | HIGH | P3 |

## Design System Recommendations for Pomodoro

### Applying Keep Style to Pomodoro

| Pomodoro Screen | Keep Element to Reference | Adaptation |
|-----------------|--------------------------|------------|
| **Notes** | Note cards | Yellow/white cards with quick actions |
| **History** | Keep's list view | Card-based entries with timestamps |
| **Timer** | Keep's quick note entry | Clean, minimal, FAB for start/pause |
| **Stats** | Keep's archive view | Card-based summaries |

### Applying Calendar Style to Pomodoro

| Pomodoro Screen | Calendar Element to Reference | Adaptation |
|-----------------|-------------------------------|------------|
| **History** | Event chips | Colored chips for session types |
| **Stats** | Month/week view | Visual calendar heat map |
| **Timer** | Event creation | Clean modal for session details |

### Color Recommendations

| Usage | Keep Color | Calendar Color | Recommended |
|-------|------------|-----------------|-------------|
| Primary | Purple #6442d6 | Blue #1a73e8 | Purple (M3 default) |
| Work Session | Yellow #fff9c4 | Blue #e8f0fe | Yellow/Orange |
| Break Session | Green #c8e6c9 | Green #e6f4ea | Green |
| Long Break | Blue #bbdefb | Purple #f3e8fd | Blue |
| Surface | White #ffffff | White #ffffff | White |
| On Surface | Dark gray #1f1f1f | Dark gray #1f1f1f | Dark gray |

## Sources

- Material Design 3 (m3.material.io) - Official design system documentation
- Material Components Web (MDC) - Component specifications
- Google Keep (keep.google.com) - Reference application
- Google Calendar (calendar.google.com) - Reference application

---

*Feature research for: Pomodoro App v2.0 UI Redesign - Google Keep/Calendar Aesthetic*
*Researched: 2026-02-21*
