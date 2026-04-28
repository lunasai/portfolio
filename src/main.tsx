import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const base = import.meta.env.BASE_URL
document.documentElement.style.setProperty(
  '--brand-icon-mask',
  `url("${base}figma/luna-logo.svg")`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
