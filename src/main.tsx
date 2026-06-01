import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n' // debe importarse antes que App para que las traducciones estén listas
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
