# Architecture Research: Redux Toolkit Integration

**Domain:** Pomodoro Timer — State Management Migration
**Researched:** 2026-02-21
**Confidence:** HIGH

---

# v2.4 Update: Footer with Privacy Policy and Terms of Use

**Added:** 2026-02-24
**Confidence:** HIGH

This section covers integration architecture for footer with legal links that open in modals.

---

## Executive Summary

This milestone adds a footer with Privacy Policy and Terms of Use links that open in modals. The existing Pomodoro app uses a sidebar navigation layout with modal-based Settings and Help panels. The footer should integrate seamlessly by reusing established patterns.

**Key decisions:**
1. **Reuse modal pattern** - Use existing Overlay + Modal styled-components from Settings/HelpPanel
2. **Local state only** - No Redux needed for simple footer modal toggles
3. **Reusable LegalModal** - Single component for both Privacy Policy and Terms of Use
4. **Footer placement** - Inside MainContent, below ContentArea

---

## Current Architecture

### Layout Structure (App.tsx)

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌────────────────────────────────────┐     │
│  │ Sidebar  │  │           MainContent              │     │
│  │          │  │  ┌────────────────────────────┐    │     │
│  │ - Timer  │  │  │         TopBar (65px)      │    │     │
│  │ - History│  │  └────────────────────────────┘    │     │
│  │ - Stats  │  │  ┌────────────────────────────┐    │     │
│  │ - Settings│ │  │      ContentArea           │    │     │
│  │          │  │  │  (Timer/History/Stats/etc) │    │     │
│  │          │  │  └────────────────────────────┘    │     │
│  │          │  │  ┌────────────────────────────┐    │     │ ← NEW: Footer
│  │          │  │  │         Footer            │    │     │
│  └──────────┘  │  └────────────────────────────┘    │     │
│                └────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                     Modal Layer (z-index: 1000)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    LegalModal.tsx (Privacy Policy / Terms of Use)   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Existing Modal Pattern (Settings.tsx, HelpPanel.tsx)

The existing modal pattern is well-established and should be reused:

```typescript
// Consistent styled-components structure
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
`
```

### Layout Component Dimensions

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| AppContainer | Root flex container | `display: flex; min-height: 100vh` |
| Sidebar | Fixed navigation (240px) | `position: fixed; left: 0` |
| MainContent | Main area with sidebar margin | `margin-left: 240px; flex: 1` |
| TopBar | Header area | Fixed at top, 64px height + 16px padding = 65px effective |
| ContentArea | View container | `height: calc(100vh - 65px)` |
| Footer | Bottom links | Inside MainContent, below ContentArea |

---

## Recommended Project Structure

```
src/
├── components/
│   ├── Footer.tsx           # NEW: Footer with links
│   ├── LegalModal.tsx       # NEW: Reusable modal for Privacy/Terms
│   ├── Settings.tsx         # EXISTING: Modal + page views
│   ├── HelpPanel.tsx        # EXISTING: Modal only
│   ├── Sidebar.tsx          # EXISTING: Navigation
│   └── ui/
│       └── theme.ts          # EXISTING: Design tokens
└── App.tsx                  # EXISTING: Layout composition (add Footer)
```

---

## Integration Points

### 1. LegalModal.tsx (NEW)

Create a reusable modal component:

```typescript
interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode  // Legal content
}
```

**Implementation notes:**
- Reuse Overlay and Modal styled-components pattern from Settings.tsx
- Handle close on overlay click
- Handle Escape key press
- Support scrollable content for long legal text
- Position: `src/components/LegalModal.tsx`

### 2. Footer.tsx (NEW)

Create footer with link buttons:

```typescript
const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
`

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
`

const FooterLink = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 4px 8px;

  &:hover {
    color: #136dec;
  }
`
```

**State management:**
- Use local `useState` for modal visibility
- No Redux needed - simple UI state, no persistence or cross-component sharing

### 3. App.tsx Integration

Add Footer below ContentArea inside MainContent:

```typescript
// In App.tsx MainContent styled-component area
<ContentArea>
  {/* View content */}
</ContentArea>

<Footer>
  <FooterLinks>
    <FooterLink onClick={() => setShowPrivacy(true)}>Privacy Policy</FooterLink>
    <FooterLink onClick={() => setShowTerms(true)}>Terms of Use</FooterLink>
  </FooterLinks>
</Footer>

{showPrivacy && (
  <LegalModal
    isOpen={showPrivacy}
    onClose={() => setShowPrivacy(false)}
    title="Privacy Policy"
  >
    {/* Privacy policy content */}
  </LegalModal>
)}
```

---

## Build Order

1. **LegalModal.tsx** - Create reusable modal component first
2. **Footer.tsx** - Build footer with link buttons and modal triggers
3. **App.tsx integration** - Add Footer to MainContent layout

### Step 1: LegalModal.tsx

- Create reusable modal with title and content props
- Include close button and overlay click handler
- Support scrollable content for legal text
- Add to `src/components/LegalModal.tsx`

### Step 2: Footer.tsx

- Create Footer component with Privacy Policy and Terms of Use links
- Manage modal visibility with local useState
- Import and render LegalModal for each link
- Add to `src/components/Footer.tsx`

### Step 3: App.tsx Integration

- Import Footer component
- Place below ContentArea, inside MainContent
- Ensure proper spacing and styling

---

## Design Tokens to Use

From `src/components/ui/theme.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| colors.textMuted | #666666 | Footer text color |
| colors.primary | #136dec | Link hover color |
| colors.border | #E0E0E0 | Footer border |
| transitions.fast | 150ms ease | Hover transitions |
| radii.md | 8px | Rounded corners if needed |

---

## Data Flow

```
User clicks footer link
       ↓
Footer component: setState({ privacyModal: true })
       ↓
LegalModal renders with isOpen={true}
       ↓
User reads/clicks close/overlay/Escape
       ↓
Footer component: setState({ privacyModal: false })
       ↓
LegalModal unmounts
```

No Redux needed - this is simple UI state with no side effects or persistence requirements.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating Separate Modals for Each Legal Document

**What people do:** Create PrivacyPolicyModal.tsx and TermsOfUseModal.tsx as separate components
**Why it's wrong:** Duplicated modal styling, maintenance burden
**Do this instead:** Create single LegalModal.tsx with children/content prop

### Anti-Pattern 2: Adding Redux State for Simple UI Toggles

**What people do:** Add legalModal slice to Redux store
**Why it's wrong:** Over-engineering - no cross-component sharing needed
**Do this instead:** Use local useState in Footer component

### Anti-Pattern 3: Putting Footer Outside MainContent

**What people do:** Place footer as sibling to MainContent in AppContainer
**Why it's wrong:** Would require adjusting margins, breaks layout consistency
**Do this instead:** Place inside MainContent, below ContentArea

### Anti-Pattern 4: Using Different Modal Styles

**What people do:** Create new styled-components for modals instead of reusing
**Why it's wrong:** Inconsistent UX, more code to maintain
**Do this instead:** Copy Overlay/Modal pattern from Settings.tsx or extract to shared file

---

## Sources

- Existing codebase:
  - `src/App.tsx` - Layout structure
  - `src/components/Settings.tsx` - Modal pattern reference
  - `src/components/HelpPanel.tsx` - Modal pattern reference
  - `src/components/ui/theme.ts` - Design tokens
- Styled-components documentation: https://styled-components.com/docs

---

*Architecture research for: Redux Toolkit integration + v2.2 features (streak, CSV export/import) + v2.3 (rich text notes) + v2.4 (footer with legal modals)*
*Researched: 2026-02-21 (base), 2026-02-23 (v2.2 update), 2026-02-24 (v2.3 update), 2026-02-24 (v2.4 update)*
