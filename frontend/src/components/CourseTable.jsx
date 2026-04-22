// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/components/CourseTable.jsx
// DEVELOPER: Anak 7 (Frontend - Dashboard Components)
// DESKRIPSI: Tabel prediksi nilai mata kuliah dengan grade bar dan confidence bar
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react'
import { BookOpen, Target } from 'lucide-react'

const GRADE_COLORS = { 
  A: 'grade-A', AB: 'grade-AB', B: 'grade-B', BC: 'grade-BC',
  C: 'grade-C', D: 'grade-D', E: 'grade-E' 
}

const GRADE_BAR_COLORS = { 
  A: 'bg-emerald-500', AB: 'bg-green-500', B: 'bg-blue-500',
  BC: 'bg-sky-500', C: 'bg-yellow-500', D: 'bg-orange-500', E: 'bg-red-500' 
}

function GradeBar({ value, max = 4 }) {
  const pct = (value / max) * 100
  let key = 'E'
  if (value >= 4.0) key = 'A'
  else if (value >= 3.5) key = 'AB'
  else if (value >= 3.0) key = 'B'
  else if (value >= 2.5) key = 'BC'
  else if (value >= 2.0) key = 'C'
  else if (value >= 1.0) key = 'D'

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mt-1.5">
      <div 
        className={`h-full rounded-full ${GRADE_BAR_COLORS[key] || 'bg-gray-400'} transition-all duration-500`}
        style={{ width: `${pct}%` }} 
      />
    </div>
  )
}

function ConfidenceBar({ value }) {
  let color = 'bg-yellow-500'
  if (value >= 80) color = 'bg-emerald-500'
  else if (value >= 70) color = 'bg-blue-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }} 
        />
      </div>
      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 w-8 text-right tabular-nums">
        {value}%
      </span>
    </div>
  )
}

export default function CourseTable({ courses }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">Tidak ada data mata kuliah prediksi.</p>
      </div>
    )
  }

  const totalSks = courses.reduce((s, c) => s + c.sks, 0)
  const avgPrediksi = courses.reduce((s, c) => s + c.prediksi_nilai_angka, 0) / courses.length

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="section-title">Prediksi Nilai Mata Kuliah</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rekomendasi mata kuliah dan estimasi pencapaian nilai
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto -mx-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Kode</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Mata Kuliah</th>
              <th className="px-4 py-3 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">SKS</th>
              <th className="px-4 py-3 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Nilai</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Angka</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest w-48">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {courses.map((course) => (
              <tr key={course.kode} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {course.kode}
                  </code>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.nama}</p>
                    <GradeBar value={course.prediksi_nilai_angka} />
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-black text-gray-700 dark:text-gray-200">
                    {course.sks}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black shadow-sm ${GRADE_COLORS[course.prediksi_nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>
                    {course.prediksi_nilai_huruf}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-black text-gray-700 dark:text-gray-200 tabular-nums">
                    {course.prediksi_nilai_angka.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ConfidenceBar value={course.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mt-2">
        {courses.map((course) => (
          <div key={course.kode} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[10px] font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700 text-gray-500">
                    {course.kode}
                  </code>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.sks} SKS</span>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{course.nama}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${GRADE_COLORS[course.prediksi_nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>
                  {course.prediksi_nilai_huruf}
                </span>
                <p className="text-[10px] font-bold text-gray-400 mt-1 tabular-nums">{course.prediksi_nilai_angka.toFixed(1)}</p>
              </div>
            </div>
            <ConfidenceBar value={course.confidence} />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Total: {courses.length} mata kuliah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Beban: {totalSks} SKS</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Rata-rata Prediksi:</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{avgPrediksi.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
