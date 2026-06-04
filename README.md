# AI Ops Platform

An operations management platform powered by AI, built with React and TypeScript.
All data is served through local mock services with simulated network delays —
no backend required.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + CSS Modules |
| UI | Ant Design 6 + Radix UI |
| State | Zustand |
| Charts | Recharts 3 |
| Routing | React Router DOM 7 |
| Forms | React Hook Form |

## Getting Started

Requires Node.js >= 18 and npm >= 9.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run build:single  # single-file build
npm run preview    # preview production build
npm run lint       # ESLint
```

## Project Structure

```
src/
├── components/    UI components
├── hooks/         Custom hooks
├── layouts/       Sidebar, navigation
├── mock/          Mock data layer
├── pages/         Page components by domain
├── router/        Route definitions
├── services/      Data service layer
├── styles/        Global styles & tokens
└── utils/         Utilities
```

## License

MIT
