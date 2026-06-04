import { Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { MainLayout } from './layouts'
import { routerConfig } from './app/router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLoader } from './modules/shared/PageLoader'

function Loading() {
  return <PageLoader />
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
