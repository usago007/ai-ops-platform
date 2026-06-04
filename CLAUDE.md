# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **前置阅读（按顺序）**:
> 1. `AGENTS.md` — AI agent 行为约束、UI 规则、组件复用规则、修改边界
> 2. `.claude/product-baseline.md` — 3 层产品架构、3 种页面模版、视觉基线、旧页迁移规则
>
> 不再重新讨论产品层级、首页定位、Ant 风格或旧页留存。

## Build & Development

```bash
npm install              # Node >= 18, npm >= 9
npm run dev              # Vite dev server → http://localhost:3000
npm run build            # Production build → dist/
npm run build:single     # Single-file build (vite.single-file.config.ts)
npm run preview          # Preview production build
npm run lint             # ESLint
```

There are no tests in this project.

## Architecture

### Two coexisting data layers (legacy + V1 migration in progress)

**V1 (new) — `src/adapters/`**
- Centralized in-memory `store` (`adapters/mock/store.ts`) seeds 14 domain collections once and exposes CRUD getters.
- Adapter objects (`mockConversationAdapter`, `mockLeadAdapter`, etc. in `adapters/mock/index.ts`) wrap store methods with simulated network delays (40–150ms).
- Used by all pages under `src/modules/`.
- Designed with API adapter interfaces (`adapters/api/types.ts`) so swapping to a real backend means implementing those interfaces.

**Legacy — `src/services/`**
- Each service (`*Service.ts`) calls a corresponding data store (`*Data.ts`) through a thin `demoApi` wrapper (`services/demoApi.ts`) that adds simulated delay.
- Previously used by pages under `src/pages/` (all prefixed `/legacy/` in routing). Legacy pages have been deleted (2026-06); `src/pages/` now only contains `NotFoundPage`.
- The `mock/` directory (`mock/data/factory.ts`, `mock/engine.ts`) provides standalone mock generators and a simulated NLP pipeline, previously used by the legacy layer. These files remain but are no longer referenced by any active page.

**Rule: New features go in `modules/` using adapters. `src/services/` and `src/mock/` are frozen.**

### Two UI generations (routing)

Routes are defined in `src/app/router.tsx` (used by `App.tsx`). There is also a stale copy at `src/router/index.tsx` that is NOT used — only `app/router.tsx` matters.

- **V1 main chain** (top-level paths): `/overview`, `/cs/workspace`, `/leads/:id`, `/product/list`, `/sys/*`
- **Legacy** (under `/legacy/*`): inquiry, biz, mkt, marketing, rules, selling-point, landing-page, old system pages. All legacy page components have been deleted (2026-06); routes show a `LegacyRoutePage` banner with a link to the equivalent V1 page.
- Legacy routes that have V1 equivalents show a `LegacyRoutePage` with a banner redirecting to the new page.
- **BrowserRouter** with `basename={import.meta.env.BASE_URL}` (set in `main.tsx`).

### Core business pipeline (state machine)

The app models an AI-assisted B2B sales pipeline with strict state transitions:

```
Conversation → InquiryDraft → Lead → SolutionRecommendation → ReplyDraft + QuotationDraft → Outcome → KnowledgeItem (loopback)
```

**`contracts/state-machine.ts`** — Defines allowed state transitions for 6 entity types (`STATE_TRANSITIONS`) and transition event→status maps.

**`domain/state-machine.ts`** — Validates transitions via `canTransition()`. Convenience wrappers: `canTransitionConversation()`, `canTransitionLead()`, etc.

**`domain/pipeline.ts`** — Orchestrates the full pipeline. Key exports:
- `PipelineContext` — holds all 7 domain objects for a single flow
- `resolveCurrentStage()` — derives pipeline stage from context
- `canAdvanceTo()` — checks prerequisites before advancing
- `advanceConversation()`, `advanceInquiryDraft()`, `advanceLead()` — validate + transition helpers

**`domain/queries.ts`** — Pure aggregation functions: `getOverviewSummary()`, `getProductContributions()`, `getLeadTrackingChain()`, `getEngineTrace()`, `getRecentOutcomeDrivers()`, etc. Pages should use these rather than inline filter/map/reduce.

### Directory conventions

| Directory | Purpose |
|-----------|---------|
| `src/contracts/` | TypeScript type definitions for all 14 domain objects + shared enums. Barrel at `contracts/index.ts`. |
| `src/domain/` | Pure logic — state machine, pipeline orchestration, queries. No React, no side effects. |
| `src/adapters/mock/` | V1 data layer — store + per-entity mock generators + adapter objects. |
| `src/modules/` | V1 page components. Each module has its own directory with an `index.ts` barrel. |
| `src/modules/shared/` | Shared UI shell (`PageShell`, `FlowPanel`, `ReviewPanel`, `InfoStrip`, etc.) for V1 pages. |
| `src/components/` | Shared presentational components (AITypingIndicator, ConfidenceBadge, etc.). |
| `src/layouts/` | `MainLayout` — sidebar, header, breadcrumbs, legacy banner. |
| `src/pages/` | `NotFoundPage` only; all legacy pages deleted (2026-06). |
| `src/services/` | Legacy service layer. |
| `src/styles/` | Global CSS (`global.css`), design tokens (`tokens.css`), form styles, chart colors. |
| `src/hooks/` | Shared hooks (`useKeyboardShortcuts`). |

### Tech stack

- **React 19** + **TypeScript 6** (strict mode, `erasableSyntaxOnly`)
- **Vite 8** with `@vitejs/plugin-react`, path alias `@/` → `./src/`
- **Ant Design 6** — primary UI kit (Card, Button, Tag, Steps, Descriptions, Table, etc.)
- **Tailwind CSS 4** + **CSS Modules** (`*.module.css`) — both used; prefer CSS Modules for component-scoped styles
- **React Router DOM 7** — BrowserRouter with basename, all pages lazy-loaded via `React.lazy()`
- **Recharts 3** + **ECharts 6** — charting
- **Zustand 5** — client state (installed but minimally used; most state is local `useState`/`useEffect`)
- **React Hook Form 7** — forms
- **Lucide React** + **@ant-design/icons** — icons (aliased through `src/iconMap.ts`)
- **Sonner** — toast notifications
- **Geist** font — primary typeface (design tokens reference it)

### Patches

`patches/es-toolkit/compat/` contains patched `.mjs` files for 10 `es-toolkit/compat` functions (`get`, `omit`, `range`, `last`, `maxBy`, `minBy`, `uniqBy`, `sortBy`, `isPlainObject`, `sumBy`, `throttle`). The vite config aliases these imports to the patched versions. If you update `es-toolkit`, verify the patches still apply.

### Key patterns

- **Adapters over services for new code**: Import from `@/adapters` and call mock adapter methods directly. Do not add new services.
- **Domain logic stays in `domain/`**: State validation, pipeline progression, and data queries belong there — not in components.
- **Lazy-loaded routes**: All pages in `app/router.tsx` use `React.lazy()` with named-export extraction (`.then(m => ({ default: m.SomePage }))`).
- **`vite.config.ts` excludes `src/app/router.tsx` from React refresh** to avoid losing router state on HMR.
- **Simulated delays**: All mock adapters add random delays (40–1200ms) to feel realistic. Don't remove them — they surface loading states during development.
