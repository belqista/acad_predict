// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/App.jsx
// DEVELOPER: Anak 5 (Frontend - Setup & Config)
// DESKRIPSI: Root component dengan routing dan dark mode
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Import statements (6 baris)
// 1. import { Routes, Route } from 'react-router-dom'
// 2. import { useState, useEffect } from 'react'
// 3. import Landing from './pages/Landing'
// 4. import Dashboard from './pages/Dashboard'
// 5. import Navbar from './components/Navbar'

// TODO: App component function (30 baris)
// function App() {
//   // Dark mode state dengan localStorage persistence
//   const [darkMode, setDarkMode] = useState(() => {
//     const saved = localStorage.getItem('darkMode')
//     return saved ? JSON.parse(saved) : false
//   })
//
//   // Effect untuk sync dark mode dengan DOM dan localStorage
//   useEffect(() => {
//     localStorage.setItem('darkMode', JSON.stringify(darkMode))
//     if (darkMode) {
//       document.documentElement.classList.add('dark')
//     } else {
//       document.documentElement.classList.remove('dark')
//     }
//   }, [darkMode])
//
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
//       <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
//       <Routes>
//         <Route path="/" element={<Landing />} />
//         <Route path="/dashboard/:nim" element={<Dashboard />} />
//       </Routes>
//     </div>
//   )
// }
//
// export default App

// CATATAN:
// - darkMode state: boolean untuk toggle dark/light mode
// - localStorage: persist dark mode preference across sessions
// - useEffect: sync darkMode dengan 'dark' class di <html>
// - Tailwind dark: prefix untuk dark mode styles
// - Routes: define 2 routes (Landing dan Dashboard)
// - Landing: path="/" (home page dengan search)
// - Dashboard: path="/dashboard/:nim" (detail mahasiswa dengan NIM param)
// - Navbar: persistent navigation bar dengan dark mode toggle
// - min-h-screen: ensure full viewport height
// - transition-colors: smooth transition saat toggle dark mode
