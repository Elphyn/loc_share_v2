import { StrictMode } from 'react'
import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = Buffer
window.process = process
window.global = window

import { createRoot } from 'react-dom/client'
import './index.css'
import './globals.css'
import App from './App.jsx'
import { IPCProvider } from './contexts/useIPCContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IPCProvider>
      <App />
    </IPCProvider>
  </StrictMode>,
)
