import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './redesign.css'
import './reference-dashboard.css'
import './vaynex-landing.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
