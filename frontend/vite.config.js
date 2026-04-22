// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/vite.config.js
// DEVELOPER: Anak 5 (Frontend - Setup & Config)
// DESKRIPSI: Konfigurasi Vite build tool
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Import statements (2 baris)
// 1. import { defineConfig } from 'vite'
// 2. import react from '@vitejs/plugin-react'

// TODO: Export default configuration
// export default defineConfig({
//   plugins: [react()],  // Enable React plugin
//   server: {
//     port: 3000,  // Dev server port
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8000',  // Backend API URL
//         changeOrigin: true,
//       },
//       '/health': {
//         target: 'http://localhost:8000',  // Backend health check
//         changeOrigin: true,
//       },
//     },
//   },
// })

// CATATAN:
// - Vite adalah build tool modern yang sangat cepat
// - Plugin React untuk JSX transform dan Fast Refresh
// - Proxy untuk forward API requests ke backend (avoid CORS)
// - Port 3000 untuk frontend, 8000 untuk backend
// - changeOrigin: true untuk handle virtual hosted sites
