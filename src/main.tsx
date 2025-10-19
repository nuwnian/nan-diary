import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/globals.css'
import App from './App.tsx'
// @ts-ignore
import { initFirebase } from './platform/config.js'

// Initialize Firebase before rendering the app
initFirebase();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
