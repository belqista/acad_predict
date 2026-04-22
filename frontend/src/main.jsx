// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/main.jsx
// DEVELOPER: Anak 5 (Frontend - Setup & Config)
// DESKRIPSI: React entry point - mount app ke DOM
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// CATATAN:
// - ReactDOM.createRoot: React 18 concurrent rendering API
// - document.getElementById('root'): mount point dari index.html
// - React.StrictMode: enable additional checks dan warnings (dev only)
// - BrowserRouter: enable client-side routing dengan HTML5 history API
// - App: root component yang berisi semua routes dan logic
// - index.css: global styles dan Tailwind directives
// - File ini SANGAT SEDERHANA, hanya bootstrap React app
