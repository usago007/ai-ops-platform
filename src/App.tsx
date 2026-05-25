import { Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { MainLayout } from './layouts'
import { routerConfig } from './router'
import { ErrorBoundary } from './components/ErrorBoundary'

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: 80 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<Loading />}>
        <Routes location={location}>
          {routerConfig.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  )
}

export default App
