# Project Research Summary

**Project:** Pomodoro Timer
**Domain:** Productivity App — Web Application
**Researched:** 2026-02-24
**Confidence:** HIGH

---

## Executive Summary

This research covers v2.4: adding a footer with Privacy Policy and Terms of Use links that open in modals. The Pomodoro Timer is an established React-based productivity app using Redux Toolkit, styled-components, and IndexedDB for local storage.

The recommended approach requires **no new dependencies**. The existing modal infrastructure (from Settings.tsx and HelpPanel.tsx) should be reused for legal document display. Local useState is sufficient for modal toggling - Redux is unnecessary for this simple UI state. The footer should be placed inside MainContent below ContentArea, consistent with the existing layout pattern.

Key risks include accessibility failures (focus management in modals), inconsistent modal behavior compared to existing patterns, and footer positioning issues on pages with varying content lengths. All are preventable by following established codebase patterns.

---

## Key Findings

### Recommended Stack

The existing tech stack fully supports v2.4 without additions. No new dependencies, packages, or tools are needed.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|----------------|
| React | 18.x | UI framework | Already in use — no change needed |
| TypeScript | 5.x | Type safety | Already in use — no change needed |
| styled-components | 6.x | CSS-in-JS styling | Already in use — modal patterns already defined |
| Redux Toolkit | 2.x | State management | Optional — local useState is simpler for this feature |

**Core technologies:**
- **React 18.x:** Already in use, no changes needed
- **styled-components:** Existing modal patterns from Settings.tsx and HelpPanel.tsx should be reused
- **Local useState:** Sufficient for modal visibility; no Redux needed for simple UI toggles

### Expected Features

**Must have (table stakes):**
- Footer component — Standard UI pattern, positioned at bottom of main content area
- Privacy Policy link — Legal/compliance expectation, opens modal with content
- Terms of Use link — Legal/compliance expectation, opens modal with content
- Modal display for legal content — Keeps users in-app rather than navigating away
- Copyright notice — Professional polish (format: "2026 Pomodoro Timer")
- Visual separation from content — Clear boundary using border-top or spacing

**Should have (competitive):**
- In-app modal vs new tab — Better UX, leverages existing modal infrastructure
- Responsive footer layout — Works across mobile/tablet/desktop
- Accessible link styling — Keyboard navigation and screen reader support

**Defer (v2.5+):**
- Contact link — for user inquiries
- Accessibility statement — if app grows to require it
- Cookie consent banner — Not needed for local-only app with no tracking

### Architecture Approach

The layout structure places the Footer inside MainContent, below ContentArea. This is consistent with the sidebar navigation pattern and avoids margin adjustments required if placed elsewhere.

**Major components:**
1. **LegalModal.tsx** — Reusable modal component for Privacy Policy and Terms of Use, using existing Overlay + Modal styled-components
2. **Footer.tsx** — Container with Privacy Policy and Terms of Use links; manages modal visibility with local useState
3. **App.tsx** — Layout composition; adds Footer below ContentArea inside MainContent

**Data flow:**
```
User clicks footer link
       ↓
Footer component: setState({ privacyModal: true })
       ↓
LegalModal renders with isOpen={true}
       ↓
User reads/clicks close/overlay/Escape
       ↓
LegalModal unmounts
```
No Redux needed — simple UI state with no side effects or persistence requirements.

### Critical Pitfalls

1. **Modal Focus Management Failures** — Focus must move to modal on open, return to trigger on close. Screen reader users become disoriented otherwise. Reuse existing modal pattern with proper ARIA attributes.

2. **Inconsistent Modal Behavior** — Legal modals must match Settings/Help modal behavior exactly (close on backdrop click, Escape key, close button). Different behavior creates user confusion.

3. **Footer Positioning Breakage** — Footer appears in middle of page on short content, or overlaps content on long pages. Use flexbox pattern with `margin-top: auto` or CSS Grid.

4. **Missing or Incomplete Legal Content** — Must customize template for this specific app (IndexedDB storage, session history). Include all required sections: data collected, how used, third-party services, cookies, data retention, user rights, contact info.

5. **XSS in Rich Text (v2.3)** — If displaying user HTML content, always sanitize with DOMPurify. This applies to any future rich text features.

---

## Implications for Roadmap

Based on research, v2.4 has a clear, single-phase implementation path:

### Phase 1: Footer with Legal Modals
**Rationale:** Self-contained feature with well-established patterns in existing codebase. No complex dependencies or multi-phase work.

**Delivers:**
- Footer component with Privacy Policy and Terms of Use links
- LegalModal reusable component
- Proper legal content for both documents
- Accessibility-compliant modals matching existing patterns

**Addresses:**
- Footer component (FEATURES.md table stakes)
- Privacy Policy link + modal (FEATURES.md P1)
- Terms of Use link + modal (FEATURES.md P1)
- Legal content (FEATURES.md P2)
- Copyright notice (FEATURES.md P2)

**Avoids:**
- Pitfall #1: Focus management failures (use existing modal pattern)
- Pitfall #2: Inconsistent modal behavior (match Settings/Help exactly)
- Pitfall #3: Footer positioning breakage (use flexbox pattern)
- Pitfall #4: Missing/incomplete legal content (customize for app)

### Build Order

1. **LegalModal.tsx** — Create reusable modal component first
   - Reuse Overlay and Modal styled-components from Settings.tsx
   - Handle close on overlay click
   - Handle Escape key press
   - Support scrollable content for long legal text

2. **Footer.tsx** — Build footer with link buttons and modal triggers
   - Manage modal visibility with local useState
   - Import and render LegalModal for each link

3. **App.tsx Integration** — Add Footer to MainContent layout
   - Place below ContentArea, inside MainContent
   - Ensure proper spacing and styling

### Phase Ordering Rationale

- **Single phase for v2.4:** The footer feature is straightforward — no complex dependencies or phasing needed
- **Reuse over rebuild:** All infrastructure (modals, styling) already exists; implementation is assembly not construction
- **Legal content as subtask:** Writing actual legal text is a task within the phase, not a separate phase

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1 (Footer):** Well-documented modal patterns exist in codebase (Settings.tsx, HelpPanel.tsx)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new technologies; existing patterns fully cover requirements |
| Features | HIGH | Standard web app patterns; well-documented table stakes |
| Architecture | HIGH | Clear integration points; existing codebase provides complete patterns |
| Pitfalls | HIGH | Focus management, positioning, and legal content issues are well-known |

**Overall confidence:** HIGH

### Gaps to Address

- **Legal content customization:** Research assumes standard local-only app patterns. Verify specific privacy policy language meets requirements for distribution platform (if any).
- **Mobile responsive testing:** Ensure legal modals work properly at mobile widths (375px).

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: Settings.tsx — Verified modal pattern implementation (Overlay, Modal, Header, Content, CloseButton)
- Existing codebase: HelpPanel.tsx — Verified alternative modal implementation
- Existing codebase: App.tsx — Verified layout structure
- Existing codebase: ui/theme.ts — Verified design tokens

### Secondary (MEDIUM confidence)
- WebAIM JavaScript Accessibility — Accessibility principles for modal dialogs
- WCAG 2.1 — Focus management requirements for modal dialogs
- Nielsen Norman Group footer design guidelines

---

*Research completed: 2026-02-24*
*Ready for roadmap: yes*
