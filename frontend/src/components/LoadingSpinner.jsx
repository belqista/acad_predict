// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/components/LoadingSpinner.jsx
// DEVELOPER: Anak 6 (Frontend - API Client & Shared Components)
// DESKRIPSI: Komponen loading spinner animasi untuk state loading
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react'

export function LoadingSpinner({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        {/* Lingkaran luar */}
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900 animate-spin border-t-indigo-600 dark:border-t-indigo-400"></div>
        {/* Lingkaran dalam */}
        <div 
          className="absolute inset-4 w-8 h-8 rounded-full border-4 border-purple-100 dark:border-purple-900 animate-spin border-t-purple-600 dark:border-t-purple-400"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        ></div>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  )
}

export function InlineSpinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
  )
}

export default LoadingSpinner
