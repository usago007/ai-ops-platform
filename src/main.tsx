import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './styles/global.css'

async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mock/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })
    } catch (e) {
      console.warn('MSW failed to start, mocking disabled:', e)
    }
  }
}

enableMocking().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HashRouter>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </HashRouter>
    </React.StrictMode>,
  )
})
