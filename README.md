# AI Ops Platform

[![Deployed on GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Visit%20Online-1d4ed8?style=for-the-badge&logo=github)](https://usago007.github.io/ai-ops-platform/)

AI Ops Platform is an operational command centre for B2B enquiry handling, product matching, knowledge reuse, and AI foundation governance. It is built for teams that need one place to track business intake, assisted response generation, quotation progress, outcome feedback, and the runtime health of the AI capabilities behind those workflows.

## Solution Scenario

Sales, service, product, and operations teams often work across separate tools while AI-assisted steps run without clear business traceability. This platform brings those activities into one operational view: customer conversations become leads, leads connect to product assets and solution recommendations, generated replies and quotations are reviewed as part of the workflow, and outcomes feed the knowledge base and system metrics.

The system is designed around operational evidence rather than campaign reporting. Each page focuses on the current state of work, the quality of AI support, the next action required, and the impact on conversion, cost, latency, and knowledge reuse.

## Product Capabilities

- Business overview with global operating metrics, trend analysis, conversion signals, product contribution, risk reminders, and shortcuts into the main work areas.
- Customer service workspace for reviewing inbound conversations, extracting customer intent, and preparing structured follow-up actions.
- Lead management covering intake, qualification, recommendation review, quotation preparation, result tracking, and outcome records.
- Product asset centre for product knowledge, pricing context, sales arguments, and related business evidence.
- Knowledge base for reusable cases, FAQs, pricing strategies, product notes, and AI-assisted knowledge generation.
- AI foundation views for system health, model usage, business metrics, cost analysis, observability, audit logs, model configuration, and Agent orchestration.
- Shared typography, spacing, icon, date-time, table, filter, and summary patterns to keep operational pages consistent across the product.

## Technical Architecture

The application is a V1 modular React frontend with a single active route layer. Routes are defined in `src/app/router.tsx` and mounted through `BrowserRouter` with the `/ai-ops-platform/` base path for GitHub Pages deployment.

| Layer | Responsibility |
| --- | --- |
| `src/contracts/` | Typed business entities and cross-module state contracts |
| `src/adapters/` | Data access boundary and fixture-backed runtime adapters |
| `src/domain/` | Aggregation, workflow, query, and state transition logic |
| `src/modules/` | Route-level product modules and reusable operational UI |
| `src/layouts/` | Application shell, sidebar navigation, and page chrome |
| `src/components/` | Lower-level reusable UI primitives and specialist visual components |
| `src/styles/` | Global design tokens, resets, and shared CSS constraints |

Core technologies:

- React 19, TypeScript, Vite, and React Router.
- Ant Design, CSS Modules, and shared semantic UI contracts for layout consistency.
- Zustand-compatible local state boundaries and typed adapter interfaces.
- Recharts for operational charts and trend panels.
- ESLint and Vite production builds as the standard verification path.

## Project Directory

```text
src/
├── adapters/      Data access boundary and runtime data providers
├── app/           Router configuration and application composition
├── components/    Reusable UI primitives and specialist components
├── contracts/     Business entity and workflow type definitions
├── domain/        Query aggregation, pipeline logic, and state machines
├── hooks/         Shared React hooks
├── layouts/       Main shell, navigation, and page frame
├── modules/       Product modules for overview, service, leads, products, knowledge, and system operations
├── styles/        Global CSS, tokens, and shared form styles
└── utils/         General utilities
```

## Build and Deployment

The repository includes a GitHub Pages workflow at `.github/workflows/deploy.yml`. Every push to `main` installs dependencies with Node.js 20, runs the production build, uploads `dist`, and publishes the application through GitHub Pages. The live deployment is available at [https://usago007.github.io/ai-ops-platform/](https://usago007.github.io/ai-ops-platform/).

Local verification commands:

```bash
npm run lint
npm run build
npm run dev -- --host localhost --port 5175
```
