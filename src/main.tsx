import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './styles/global.css'

const isSingleFile = import.meta.env.VITE_SINGLE_FILE === 'true'
const Router = isSingleFile ? HashRouter : BrowserRouter

async function enableMocking() {
  if (import.meta.env.DEV && !isSingleFile) {
    const { worker } = await import('./mock/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </Router>
    </React.StrictMode>,
  )
})
