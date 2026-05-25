# AI Ops Platform

An AI-powered operations management platform built with React and TypeScript. All data is served through local mock services via `demoApi` with simulated network delays — no backend required.

## Features

- **Business Efficiency** — Overview dashboard, inquiry-to-quotation transformation, product structuring
- **Marketing Efficiency** — AI-powered content creation, selling point extraction, landing page preview
- **Customer Service Workspace** — Intelligent customer service assistance, dialogue intent recognition
- **System Administration** — Model configuration, Agent orchestration, AI cost dashboard, audit logging, user management, observability

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 + CSS Modules |
| UI Components | Ant Design 6 + Radix UI |
| Icons | Lucide React (via custom iconMap) |
| Routing | React Router DOM 7 (HashRouter, lazy-loaded pages) |
| State Management | Zustand |
| Charts | Recharts 3 |
| Data Mocking | Local demoApi (setTimeout-based) |
| Forms | React Hook Form |
| Notifications | Sonner |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install & Run

```bash
npm install
npm run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173/ai-ops-platform/) (auto-picks next available port if in use).

### Build

```bash
# Standard production build
npm run build

# Single-file build (all assets inlined into one HTML)
npm run build:single
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/       Reusable UI components
├── hooks/            Custom React hooks
├── layouts/          Layout components (sidebar, navigation)
├── mock/             Mock data layer
│   └── data/         Data factories & generators
├── pages/            Page-level components
│   ├── biz/          Business efficiency
│   ├── conversion/   Conversion & landing pages
│   ├── cs/           Customer service workspace
│   ├── inquiry/      Inquiry & quotation
│   ├── marketing/    Content creation
│   ├── mkt/          Marketing overview
│   ├── product/      Product management
│   ├── rules/        Rule configuration
│   ├── selling-point/ Selling point extraction
│   └── system/       System administration
├── router/           Route definitions
├── services/         Data service layer
├── styles/           Global styles & design tokens
└── utils/            Utility functions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (default port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run build:single` | Single-file build (all assets inlined) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

## License

[MIT](./LICENSE)
