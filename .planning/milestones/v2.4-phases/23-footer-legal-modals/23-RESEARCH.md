# Phase 23: Footer with Legal Modals - Research

**Researched:** 2026-02-25
**Domain:** React UI Components (Modal, Footer), Accessibility, Redux State Management
**Confidence:** HIGH

## Summary

Phase 23 implements a footer with Privacy Policy and Terms of Use modals. The project already has established modal patterns (SessionSummary.tsx, HelpPanel.tsx) that should be reused. The main work involves:

1. Creating a Footer component with links and copyright notice
2. Creating LegalModal component (reusable for Privacy Policy and Terms of Use)
3. Adding Redux state for managing modal visibility
4. Drafting legal document content
5. Ensuring responsive design for mobile

**Primary recommendation:** Reuse existing modal patterns from HelpPanel.tsx which already implements backdrop click close, Escape key close, and close button. Add legal modal state to uiSlice. Create a LegalModal component that accepts title and content as props for reusability.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18 | UI framework | Already in use |
| TypeScript | - | Type safety | Already in use |
| styled-components | 6.x | Component styling | Already in use |
| Redux Toolkit | - | State management | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @reduxjs/toolkit | ^2.x | State management | Already in project |
| react-redux | ^9.x | React-Redux bindings | Already in project |

**No additional packages required** - all functionality can be achieved with existing dependencies.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Footer.tsx              # NEW: Footer component
│   ├── LegalModal.tsx           # NEW: Reusable legal modal
│   └── legal/
│       ├── PrivacyPolicy.tsx    # NEW: Privacy policy content
│       └── TermsOfUse.tsx       # NEW: Terms of use content
├── features/
│   └── ui/
│       └── uiSlice.ts           # MODIFY: Add legal modal state
```

### Pattern 1: Modal Component (from HelpPanel.tsx)

The project already has an established modal pattern:

```typescript
// From: src/components/HelpPanel.tsx (lines 35-68)

// Modal overlay
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

// Modal container
const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  padding: 24px;
  animation: modalSlideIn 0.2s ease-out;
`
```

### Pattern 2: Keyboard Event Handling (from HelpPanel.tsx)

```typescript
// From: src/components/HelpPanel.tsx (lines 173-192)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isOpen])
```

### Pattern 3: Backdrop Click Close

```typescript
// From: src/components/HelpPanel.tsx (lines 194-199)
const handleOverlayClick = (e: React.MouseEvent) => {
  if (e.target === e.currentTarget) {
    setIsOpen(false)
  }
}

// Usage:
<Overlay onClick={handleOverlayClick}>
  <Modal onClick={(e) => e.stopPropagation()}>
```

### Pattern 4: Redux State for Modals (from uiSlice.ts)

```typescript
// From: src/features/ui/uiSlice.ts
export interface UIState {
  viewMode: ViewMode
  isDrawerOpen: boolean
  selectedSessionId: string | null
  showSummary: boolean
  // Add for legal modals:
  showPrivacyPolicy: boolean
  showTermsOfUse: boolean
}
```

### Pattern 5: Theme Usage (from theme.ts)

```typescript
// From: src/components/ui/theme.ts
export const colors = {
  primary: '#136dec',
  primaryHover: '#0d5bc4',
  // ... existing colors
}

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal backdrop | Custom overlay implementation | Reuse styled-components Overlay from HelpPanel.tsx | Already tested, consistent with project |
| Keyboard handling | Separate Escape handler | Reuse pattern from HelpPanel.tsx | Consistent UX across app |
| Modal state | Local useState | Add to uiSlice | Consistent with showSummary pattern |
| Close button | Custom button | Reuse styled CloseButton | Consistent with existing UI |

**Key insight:** HelpPanel.tsx and SessionSummary.tsx already implement all required modal behaviors. Copy these patterns.

## Common Pitfalls

### Pitfall 1: Missing Focus Management
**What goes wrong:** After closing modal, focus doesn't return to trigger element
**Why it happens:** React modals trap focus but don't restore it
**How to avoid:** Store button ref and restore focus on close
**Warning signs:** Tab navigation jumps unexpectedly after modal close

### Pitfall 2: Scroll Lock Missing
**What goes wrong:** Background page can be scrolled while modal is open
**Why it happens:** No body scroll lock implemented
**How to avoid:** Add body overflow: hidden when modal opens
```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'unset'
  }
}, [isOpen])
```

### Pitfall 3: Missing ARIA Attributes
**What goes wrong:** Screen readers don't announce modal properly
**Why it happens:** Missing role="dialog", aria-modal, aria-labelledby
**How to avoid:** Add accessibility attributes:
```typescript
<Overlay role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <Modal>
    <Title id="modal-title">Privacy Policy</Title>
```

### Pitfall 4: Footer Placement
**What goes wrong:** Footer doesn't stick to bottom on short content
**Why it happens:** Using position: fixed instead of flexbox layout
**How to avoid:** Use flexbox with flex-grow: 1 on main content area
```typescript
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`
// Footer will naturally sit at bottom
```

### Pitfall 5: Mobile Responsiveness
**What goes wrong:** Footer content wraps or overflows on small screens
**Why it happens:** Fixed widths or no media queries
**How to avoid:** Use flex-wrap and media queries:
```typescript
const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 24px;

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`
```

## Code Examples

### Footer Component Structure

```typescript
// src/components/Footer.tsx

import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: white;
  border-top: 1px solid ${colors.border};
  font-size: 0.875rem;
  color: ${colors.textMuted};
`

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
`

const FooterLink = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  transition: color ${transitions.fast};

  &:hover {
    color: ${colors.primaryHover};
    text-decoration: underline;
  }
`

const Copyright = styled.span`
  font-size: 0.75rem;
`

interface FooterProps {
  onPrivacyPolicyClick: () => void
  onTermsOfUseClick: () => void
}

export default function Footer({ onPrivacyPolicyClick, onTermsOfUseClick }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <FooterContainer>
      <FooterLinks>
        <FooterLink onClick={onPrivacyPolicyClick}>Privacy Policy</FooterLink>
        <FooterLink onClick={onTermsOfUseClick}>Terms of Use</FooterLink>
      </FooterLinks>
      <Copyright>&copy; {year} Pomodoro Timer. All rights reserved.</Copyright>
    </FooterContainer>
  )
}
```

### LegalModal Component

```typescript
// src/components/LegalModal.tsx

import { useEffect } from 'react'
import styled from 'styled-components'
import { colors, transitions } from './ui/theme'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
  animation: modalSlideIn 0.2s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.textMuted};
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all ${transitions.fast};

  &:hover {
    background-color: ${colors.surface};
    color: ${colors.text};
  }
`

const Content = styled.div`
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${colors.text};

  h3 {
    font-size: 1rem;
    margin: 16px 0 8px;
  }

  p {
    margin: 8px 0;
  }

  ul {
    padding-left: 20px;
  }
`

interface LegalModalProps {
  isOpen: boolean
  title: string
  content: React.ReactNode
  onClose: () => void
}

export default function LegalModal({ isOpen, title, content, onClose }: LegalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title id="legal-modal-title">{title}</Title>
          <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
        </Header>
        <Content>{content}</Content>
      </Modal>
    </Overlay>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Local modal state | Redux modal state (showSummary) | Phase 8 | Consistent with app patterns |
| No scroll lock | Body scroll lock | Existing HelpPanel | Prevents background scroll |

**Deprecated/outdated:**
- None - all patterns in current use

## Open Questions

1. **Legal content location**
   - What we know: Need content for Privacy Policy and Terms of Use
   - What's unclear: Should content be in separate files or inline?
   - Recommendation: Separate files for maintainability (PrivacyPolicy.tsx, TermsOfUse.tsx)

2. **Footer placement integration**
   - What we know: App.tsx has MainContent and ContentArea components
   - What's unclear: Need to verify ContentArea structure allows footer at bottom
   - Recommendation: Check if MainContent uses flexbox with flex: 1

3. **Modal reuse vs separate components**
   - What we know: Need Privacy Policy and Terms of Use modals
   - What's unclear: Single LegalModal with content prop vs two separate modal components
   - Recommendation: Single LegalModal component with content passed as prop for reusability

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEGAL-01 | Footer displays at bottom of main content area | Pattern from App.tsx MainContent flex: 1 layout |
| LEGAL-02 | Privacy Policy link opens modal with content | Reuse LegalModal with PrivacyPolicy content |
| LEGAL-03 | Terms of Use link opens modal with content | Reuse LegalModal with TermsOfUse content |
| LEGAL-04 | Legal modals close on backdrop click | Pattern from HelpPanel.tsx handleOverlayClick |
| LEGAL-05 | Legal modals close on Escape key press | Pattern from HelpPanel.tsx useEffect with handleKeyDown |
| LEGAL-06 | Legal modals have close button | Pattern from HelpPanel.tsx CloseButton |
| LEGAL-07 | Copyright notice in footer | Include in Footer component |
| LEGAL-08 | Footer responsive on mobile | Use flex-wrap and media queries |
| LEGAL-09 | Privacy Policy states IndexedDB storage | Draft content in PrivacyPolicy.tsx |
| LEGAL-10 | Terms of Use defines user rights | Draft content in TermsOfUse.tsx |

## Sources

### Primary (HIGH confidence)
- src/components/HelpPanel.tsx - Existing modal patterns with backdrop click, Escape key, close button
- src/components/SessionSummary.tsx - Alternative modal pattern
- src/features/ui/uiSlice.ts - Redux state management pattern
- src/components/ui/theme.ts - Design tokens

### Secondary (MEDIUM confidence)
- Web best practices for React modal accessibility (ARIA dialog role, focus management)

### Tertiary (LOW confidence)
- None required - existing codebase patterns are authoritative

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All requirements met with existing dependencies
- Architecture: HIGH - Established patterns in codebase (HelpPanel.tsx)
- Pitfalls: HIGH - Known issues documented with existing solutions

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (30 days - stable domain)
