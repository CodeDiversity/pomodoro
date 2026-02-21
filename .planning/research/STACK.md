# Stack Research: Google Keep/Calendar Aesthetic Styling

**Domain:** CSS/Styling Additions for UI Redesign
**Researched:** 2026-02-21
**Confidence:** HIGH

## Summary

The current stack (React 18 + styled-components 6.x) is sufficient for the Google Keep/Calendar aesthetic. No new styling libraries are required. The key is enhancing the existing theme system with:

1. **Layered shadow system** for realistic elevation
2. **Motion library** for smooth interactions
3. **CSS backdrop-filter** for glassmorphism (native, no library needed)

---

## Recommended Additions

### 1. Motion Library: Framer Motion

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| framer-motion | 11.x | Animation library | Industry standard for React animations. Provides smooth layout transitions, card hover effects, and gesture-based interactions that define the Google aesthetic. |

**Why Framer Motion for Google aesthetic:**
- Google Keep cards have smooth scale/shadow transitions on hover
- Calendar events animate when resizing/moving
- Layout animations when cards reorder (masonry effect)
- Shared element transitions between views

```bash
npm install framer-motion
```

**Use Cases:**
- Card hover: `scale(1.02)` with shadow elevation change
- Page transitions: Fade + slide for modal/drawer
- List reordering: Smooth FLIP animations
- Button press: Subtle scale feedback

---

### 2. No New Styling Library Needed

The existing **styled-components 6.x** is fully capable. The aesthetic is achieved through:

| Technique | Implementation | Google Keep Reference |
|-----------|----------------|----------------------|
| **Layered shadows** | Multiple box-shadows with increasing blur | Cards float with soft, diffused shadows |
| **Elevation system** | 4-6 shadow levels (flat, hover, raised, modal) | Floating action button vs flat cards |
| **Larger border-radius** | 12px-16px for cards, 24px for buttons | Rounded, friendly appearance |
| **Backdrop blur** | Native CSS `backdrop-filter: blur()` | Modal overlays, search bar |
| **Micro-interactions** | Scale, shadow, color on hover/focus | Button feedback, card lift |

---

## Enhanced Theme Tokens

Add these to `/src/components/ui/theme.ts`:

### Shadow System (Layered)

```typescript
export const shadows = {
  // Flat - no shadow, just border
  flat: 'none',
  // Subtle - for content on surface
  subtle: '0 1px 2px rgba(0,0,0,0.05)',
  // Low - cards at rest (Google Keep default)
  low: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  // Medium - cards elevated on hover
  medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  // High - modals, dropdowns
  high: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  // Highest - dialogs, sidebars
  highest: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
} as const;
```

### Border Radius Expansion

```typescript
export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',      // Increased from 12px
  xl: '16px',      // Cards
  full: '9999px',  // Pills, FAB
} as const;
```

### Color Palette Adjustments

```typescript
export const colors = {
  // Keep the existing but add:
  surfaceElevated: '#ffffff',     // Cards stand out from background
  backdrop: 'rgba(255,255,255,0.72)', // Glassmorphism base
  // Shadow tints for colored cards (if needed)
  shadowTint: 'rgba(0,0,0,0.15)',
} as const;
```

---

## CSS Techniques for Google Aesthetic

### 1. Card Effect (Native CSS)

```css
/* Google Keep card - no border, shadow only */
.keep-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.2s ease;
}

.keep-card:hover {
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  transform: translateY(-2px);
}
```

### 2. Glassmorphism (Native CSS)

```css
/* Modal backdrop */
.glass-overlay {
  backdrop-filter: blur(8px);
  background: rgba(255,255,255,0.72);
}

/* Search bar */
.search-bar {
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.9);
}
```

### 3. FAB (Floating Action Button)

```css
.fab {
  border-radius: 16px;  /* More rounded */
  box-shadow: 0 3px 5px rgba(0,0,0,0.2), 0 3px 10px rgba(0,0,0,0.15);
}

.fab:hover {
  box-shadow: 0 6px 10px rgba(0,0,0,0.2), 0 8px 25px rgba(0,0,0,0.15);
}
```

---

## Migration Pattern

### Phase 1: Theme Updates (No new dependencies)

1. Update `theme.ts` with enhanced shadows and radii
2. Replace all `border` usage on cards with shadows only
3. Increase border-radius on cards and buttons

### Phase 2: Motion Integration

1. Install `framer-motion`
2. Add hover animations to cards
3. Add page transition to modals/drawers

### Phase 3: Polish

1. Add backdrop-filter to overlays
2. Fine-tune shadow values
3. Add micro-interactions to buttons

---

## Installation

```bash
# Add motion library
npm install framer-motion

# Optional: If you want typed variants
npm install -D @types/framer-motion
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Native CSS backdrop-filter | blurhash or react-blur | Native CSS is well-supported (2024+) |
| Framer Motion | react-spring | Framer Motion has better React 18/19 support and easier API |
| styled-components | Emotion | Same runtime, styled-components has better theme provider |

---

## Component Examples

### Keep-Style Card Component

```typescript
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { shadows, radii, spacing } from './theme';

const KeepCard = styled(motion.div)`
  background: white;
  border-radius: ${radii.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadows.low};
  cursor: pointer;
`;

export function SessionCard({ children, onClick }) {
  return (
    <KeepCard
      whileHover={{
        scale: 1.02,
        boxShadow: shadows.medium,
        y: -2
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </KeepCard>
  );
}
```

### Keep-Style Input

```typescript
const KeepInput = styled.input`
  background: transparent;
  border: none;
  border-radius: ${radii.lg};
  padding: ${spacing.md} ${spacing.lg};
  box-shadow: ${shadows.subtle};

  &:focus {
    box-shadow: ${shadows.low}, 0 0 0 2px rgba(66, 133, 244, 0.5);
  }
`;
```

---

## Version Compatibility

| Package | Current | Compatible With |
|---------|---------|-----------------|
| framer-motion | 11.x | React 16.8+, React 18, React 19 |
| styled-components | 6.3.10 | React 16.3+, framer-motion |
| Vite | 6.x | All above |

---

## Rationale Summary

**Why no new styling library:**
- styled-components is already in the stack and handles the aesthetic well
- Google Keep look is achieved through design tokens, not new tools

**Why Framer Motion:**
- Essential for the smooth, "alive" feel of Google apps
- Cards lift on hover, modals fade in, lists reorder smoothly
- Easy to add incrementally

**Why native backdrop-filter:**
- Browser support is excellent (96%+)
- No library overhead for simple blur effects
- Works perfectly with styled-components

---

## Sources

- [Framer Motion Documentation](https://www.framer.com/motion/) — v11.x API reference
- [Google Material Design 3 — Elevation](https://m3.material.io/foundations/elevation) — Shadow system principles
- [MDN — backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) — Native browser support
- [Google Keep Design Analysis](https://material.io/design/material-studies/keeps-notes.html) — Card design reference

---

*Research for: Pomodoro Timer UI Redesign (Google Keep/Calendar Aesthetic)*
*Researched: 2026-02-21*
