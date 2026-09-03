import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LocaleProvider } from '@/contexts/LocaleContext'

// When the page is restored from the browser's back-forward cache (bfcache),
// the in-memory React state may be stale.  If the token was cleared (e.g.
// after logout) force a fresh load so the auth guard re-evaluates.
window.addEventListener('pageshow', (e) => {
  if (e.persisted && !localStorage.getItem('furniture_admin_token')) {
    window.location.replace('/login')
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
)
