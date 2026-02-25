# Stack Research: v2.4 Footer with Privacy Policy and Terms of Use

**Domain:** Footer with Privacy Policy and Terms of Use Modals
**Researched:** 2026-02-24
**Confidence:** HIGH

## Executive Summary

For adding a footer with Privacy Policy and Terms of Use links that open in modals:

1. **No new dependencies needed** — The existing modal infrastructure in the codebase is fully sufficient
2. **Reuse existing modal pattern** — Settings.tsx and HelpPanel.tsx provide proven, styled modal components
3. **Local useState for modal state** — Simple, proven pattern used throughout the app
4. **Zero bundle size impact** — Only adds new React components using existing styled-components

---

## Recommended Stack

### Core Technologies

No new core technologies required. The existing stack fully supports this feature.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.x | UI framework | Already in use - no change needed |
| TypeScript | 5.x | Type safety | Already in use - no change needed |
| styled-components | 6.x | CSS-in-JS styling | Already in use - modal patterns already defined |
| Redux Toolkit | 2.x | State management | Optional - local useState is simpler for this feature |

### Supporting Libraries

No new supporting libraries required.

| Library | Purpose | When to Use |
|---------|---------|-------------|
| Existing Modal Pattern | Reusable overlay + modal components | Already implemented in Settings.tsx and HelpPanel.tsx |
| colors from theme | Consistent color usage | Already imported from `./ui/theme` |
| transitions from theme | Consistent animations | Already imported from `./ui/theme` |

### Development Tools

No new development tools required.

| Tool | Purpose | Notes |
|------|---------|-------|
| Existing ESLint/Prettier | Code formatting | Already configured |
| Vitest | Testing | Already in use |

## Installation

No new packages needed.

```bash
# No new packages required
# Existing dependencies cover all needs:
# - react, react-dom
# - styled-components
# - @reduxjs/toolkit, react-redux
```

## Existing Modal Pattern to Reuse

The codebase already has a mature modal infrastructure. **Do not create new modal infrastructure** - reuse existing patterns.

### Pattern from Settings.tsx and HelpPanel.tsx

```typescript
// 1. Container with local state for isOpen
const [isOpen, useState(false)]

// 2. Toggle button triggers isOpen
<ToggleButton onClick={() => setIsOpen(!isOpen)}>

// 3. Overlay with click-outside-to-close
<Overlay onClick={handleOverlayClick}>
  <Modal onClick={(e) => e.stopPropagation()}>
    <Header>
      <Title>Title</Title>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </Header>
    <Content>...</Content>
  </Modal>
</Overlay>

// 4. Handle overlay click
const handleOverlayClick = (e: React.MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
```

### Key Styled Components to Reuse

| Component | Source | Purpose |
|-----------|--------|---------|
| Overlay | Settings.tsx (line 213-225), HelpPanel.tsx (line 35-47) | Fixed full-screen backdrop with blur |
| Modal | Settings.tsx (line 228-248), HelpPanel.tsx (line 50-69) | Centered content container with animation |
| Header | Settings.tsx (line 251-257) | Modal header with title and close |
| Content | Settings.tsx (line 294-296) | Modal body content |
| CloseButton | Settings.tsx (line 266-291), HelpPanel.tsx (line 85-110) | X button with hover states |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| Local useState | Redux for modal state | Only if multiple components need to trigger modals |
| Reuse existing modal pattern | Install modal library (e.g., react-modal) | Only if complex portal requirements emerge |
| Footer as inline component | Separate route/page | Only if content becomes very long |
| Single reusable LegalModal | Separate modals per document | Either works; single modal is simpler |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| New modal library | Adds unnecessary bundle size; existing pattern works | Reuse styled-components modal pattern |
| React Portal | Not needed - z-index 1000 overlay works fine | Standard overlay component |
| External routing | Simple modals don't need routing | State-based modal visibility |
| Separate pages | These are short legal documents | Modal pattern from existing codebase |

## Component Architecture

### New Components Needed

| Component | Type | Responsibility |
|-----------|------|----------------|
| Footer.tsx | New | Container with links to Privacy Policy and Terms of Use |
| PrivacyPolicy.tsx | New | Privacy Policy content (can include inline modal) |
| TermsOfUse.tsx | New | Terms of Use content (can include inline modal) |

### Integration Point

Footer should be added to App.tsx layout, likely at the bottom of the main content area.

### Example: LegalModal Component

A reusable modal for legal content:

```typescript
// src/components/LegalModal.tsx
import { useState } from 'react'
import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.2s ease-out;

  @keyframes modalSlideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

// ... Header, Content, CloseButton similar to Settings.tsx

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function LegalModal({ isOpen, onClose, title, children }: LegalModalProps) {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* Header, Content, etc. */}
      </Modal>
    </Overlay>
  )
}
```

## Version Compatibility

All existing dependencies are compatible. No version constraints apply to this feature.

## Sources

- **Settings.tsx** — Verified modal pattern implementation (Overlay, Modal, Header, Content, CloseButton)
- **HelpPanel.tsx** — Verified alternative modal implementation
- **uiSlice.ts** — Verified existing Redux state structure
- **PROJECT.md** — Verified existing tech stack and constraints

---

*Research for: Pomodoro Timer v2.4 Footer with Privacy Policy and Terms of Use*
*Researched: 2026-02-24*
