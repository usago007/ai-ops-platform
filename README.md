# AI Ops Platform

An AI-powered operations management platform built with React and TypeScript. It uses MSW (Mock Service Worker) to simulate complete business workflows, allowing the application to run independently without any backend services.

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
| UI Components | Radix UI |
| Routing | React Router DOM 7 |
| State Management | Zustand |
| Charts | ECharts |
| Data Mocking | MSW (Mock Service Worker) |
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

The dev server starts at [http://localhost:3000](http://localhost:3000) and opens automatically.

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
├── mock/             MSW handlers & mock data
│   ├── data/         Data factories
│   └── handlers/     API mock handlers by module
├── pages/            Page-level components
│   ├── biz/          Business efficiency
│   ├── conversion/   Conversion & landing pages
│   ├── cs/           Customer service workspace
│   ├── dashboard/    Overview dashboard
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
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run build:single` | Single-file build (all assets inlined) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

## License

[MIT](./LICENSE)
