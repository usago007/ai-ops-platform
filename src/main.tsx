import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './styles/global.css'

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mock/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HashRouter>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </HashRouter>
    </React.StrictMode>,
  )
})
