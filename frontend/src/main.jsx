// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/main.jsx
// DEVELOPER: Anak 5 (Frontend - Setup & Config)
// DESKRIPSI: React entry point - mount app ke DOM
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Import statements (5 baris)
// 1. import React from 'react'
// 2. import ReactDOM from 'react-dom/client'
// 3. import { BrowserRouter } from 'react-router-dom'
// 4. import App from './App.jsx'
// 5. import './index.css'

// TODO: Render React app (8 baris)
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// )

// CATATAN:
// - ReactDOM.createRoot: React 18 concurrent rendering API
// - document.getElementById('root'): mount point dari index.html
// - React.StrictMode: enable additional checks dan warnings (dev only)
// - BrowserRouter: enable client-side routing dengan HTML5 history API
// - App: root component yang berisi semua routes dan logic
// - index.css: global styles dan Tailwind directives
// - File ini SANGAT SEDERHANA, hanya bootstrap React app
