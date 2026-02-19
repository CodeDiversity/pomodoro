# Stack Research

**Domain:** Pomodoro Timer Web Application
**Researched:** 2026-02-19
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x (or 18.3.x LTS) | UI Framework | Current stable (19.2.4 released Jan 2026). React 18 is also fully supported and widely used. Use 19.x for new projects, 18.3.x if stability is priority. |
| TypeScript | 5.x | Type Safety | Standard for React projects. Provides excellent IDE support and catches errors at compile time. |
| Vite | 7.x | Build Tool | Latest stable (v7.3.1). Native ES modules, instant server start, optimized builds. Industry standard for React in 2025/2026. |
| localStorage | Browser API | Persistence | No backend required. Sufficient for session notes, history, timer settings. Simple key-value storage. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| styled-components | 6.x | CSS-in-JS Styling | Latest stable (v6.3.10). Full React 18/19 support. Theme provider for dark mode. Server-side rendering support if needed later. |
| Vitest | 4.x | Unit Testing | Latest stable (v4.0.17). Vite-native testing framework. Zero-config with Vite. Fast execution. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + Prettier | Code Quality | Standard linting and formatting for TypeScript/React. Use `@typescript-eslint/eslint-plugin` and `eslint-config-prettier`. |
| @types/react | TypeScript Types | Official type definitions. Required for TypeScript support. |
| @types/react-dom | TypeScript Types | Required if using React DOM rendering. |

## Installation

```bash
# Core - Create Vite project with React TypeScript
npm create vite@latest pomodoro-timer -- --template react-ts

# Core dependencies
npm install react react-dom

# Supporting libraries
npm install styled-components

# Dev dependencies
npm install -D typescript @types/react @types/react-dom vite
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D eslint @typescript-eslint/eslint-plugin eslint-plugin-react-hooks
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React + Vite | Next.js | If you need SSR, routing, or API routes in the future. Overkill for a simple Pomodoro app. |
| styled-components | CSS Modules + CSS Variables | If team prefers no runtime overhead or is concerned about styled-components runtime cost. |
| styled-components | Tailwind CSS | If rapid prototyping is priority. However, styled-components provides better theming for dark mode. |
| Vitest | Jest | Vitest is now the standard for Vite projects. Jest requires more configuration. |
| localStorage | IndexedDB | If storing large amounts of historical session data. localStorage is sufficient for typical usage. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Deprecated, slow builds, no longer maintained | Vite (standard now) |
| Class components | Hooks are standard in React 16.8+ | Functional components with hooks |
| Enzyme | Deprecated, not compatible with React 18+ | React Testing Library |
| Redux (full) | Overkill for localStorage-based state | React Context + useState/useReducer |
| jQuery | Unnecessary in React ecosystem | React components |

## Stack Patterns by Variant

**If you need offline support:**
- Add Service Worker via Vite PWA plugin
- Use IndexedDB (via idb library) for larger data

**If you need mobile app:**
- Consider React Native or Capacitor.js
- The same React + TypeScript + styled-components stack transfers well

**If you need cloud sync later:**
- Add Supabase or Firebase
- Keep localStorage as offline cache
- Architecture supports this addition

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Vite 7.x | React 18.x, React 19.x | Works with both versions |
| Vitest 4.x | Vite 5.x, 6.x, 7.x | Full Vite compatibility |
| styled-components 6.x | React 16.3+, React 18, React 19 | Full modern React support |
| TypeScript 5.x | React 18+, Vite 5+ | Standard compatibility |

## Rationale Summary

**Why React + Vite + TypeScript:**
- Industry standard in 2025/2026 for web apps
- Vite provides excellent DX (fast dev server, instant HMR)
- TypeScript catches bugs early, especially valuable for timer logic

**Why styled-components:**
- Theming support built-in (perfect for dark mode toggle)
- Scoped styles by default
- Dynamic styling based on props (timer state, theme)

**Why localStorage:**
- No backend needed for MVP
- Synchronous API is simple for small data
- Persists across sessions

**Why Vitest:**
- Native Vite integration, zero config
- Compatible with Jest syntax (easy migration)
- Faster than Jest

## Sources

- [Vite Official Site](https://vite.dev/) — Confirmed v7.3.1 as latest stable
- [Vitest Official Site](https://vitest.dev/) — Confirmed v4.0.17 as latest stable
- [styled-components GitHub](https://github.com/styled-components/styled-components) — Confirmed v6.3.10 as latest stable (Feb 2026)
- [React GitHub](https://github.com/facebook/react) — Confirmed React 19.2.4 as latest stable (Jan 2026)
- [Vite GitHub](https://github.com/vitejs/vite) — Confirmed create-vite@8.3.0 (Feb 2026)

---

*Stack research for: Pomodoro Timer Web Application*
*Researched: 2026-02-19*
