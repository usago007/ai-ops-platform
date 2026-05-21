import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts'
import { routerConfig } from './router'

function App() {
  return (
    <MainLayout>
      <Routes>
        {routerConfig.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </MainLayout>
  )
}

export default App
