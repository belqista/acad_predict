// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/components/GradeHistoryTable.jsx
// DEVELOPER: Anak 7 (Frontend - Dashboard Components)
// DESKRIPSI: Tabel riwayat nilai per semester dengan accordion expand/collapse
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'

const GRADE_COLORS = {
  A: 'grade-A', AB: 'grade-AB', B: 'grade-B', BC: 'grade-BC',
  C: 'grade-C', D: 'grade-D', E: 'grade-E',
}

const SEM_LABELS = { 1: 'Semester 1', 2: 'Semester 2', 3: 'Semester 3', 4: 'Semester 4', 5: 'Semester 5', 6: 'Semester 6', 7: 'Semester 7', 8: 'Semester 8' }

export default function GradeHistoryTable({ riwayat }) {
  const [openSem, setOpenSem] = useState(
    riwayat.length > 0 ? riwayat[riwayat.length - 1].semester : null
  )

  const toggle = (sem) => setOpenSem(openSem === sem ? null : sem)

  if (!riwayat || riwayat.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">Tidak ada data riwayat nilai.</p>
      </div>
    )
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="section-title">Riwayat Nilai</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nilai historis akademik per semester</p>
        </div>
      </div>

      <div className="space-y-3">
        {riwayat.map((sem) => {
          const isOpen = openSem === sem.semester
          let ipsColor = 'bg-red-500'
          if (sem.ips >= 3.5) ipsColor = 'bg-emerald-500'
          else if (sem.ips >= 3.0) ipsColor = 'bg-blue-500'
          else if (sem.ips >= 2.5) ipsColor = 'bg-yellow-500'

          return (
            <div key={sem.semester} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggle(sem.semester)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${ipsColor} flex items-center justify-center text-white text-xs font-black shadow-sm`}>
                    {sem.semester}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {SEM_LABELS[sem.semester] || `Semester ${sem.semester}`}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                      {sem.sks} SKS diambil
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">IPS</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums">
                      {sem.ips.toFixed(2)}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="bg-white dark:bg-gray-900 overflow-x-auto">
                  <div className="min-w-[500px] divide-y divide-gray-100 dark:divide-gray-800/50">
                    <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      <span className="col-span-2">Kode</span>
                      <span className="col-span-6">Mata Kuliah</span>
                      <span className="col-span-1 text-center">SKS</span>
                      <span className="col-span-1 text-center">Nilai</span>
                      <span className="col-span-2 text-right">Angka</span>
                    </div>

                    {sem.nilai_matkul.map((mk) => (
                      <div key={mk.kode} className="grid grid-cols-12 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors items-center">
                        <div className="col-span-2">
                          <code className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {mk.kode}
                          </code>
                        </div>
                        <div className="col-span-6">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2 block">
                            {mk.nama}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{mk.sks}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black shadow-sm ${GRADE_COLORS[mk.nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>
                            {mk.nilai_huruf}
                          </span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-sm font-black text-gray-600 dark:text-gray-400 tabular-nums">
                            {mk.nilai_angka.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
