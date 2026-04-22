import { useState } from 'react'
import { History, ChevronDown, ChevronUp } from 'lucide-react'

const GRADE_COLORS = {
  A: 'grade-A',
  AB: 'grade-AB',
  B: 'grade-B',
  BC: 'grade-BC',
  C: 'grade-C',
  D: 'grade-D',
  E: 'grade-E',
}

const SEM_LABELS = { 1: 'Semester 1', 2: 'Semester 2', 3: 'Semester 3' }

export default function GradeHistoryTable({ riwayat }) {
  const [openSem, setOpenSem] = useState(riwayat.length > 0 ? riwayat[riwayat.length - 1].semester : null)

  const toggle = (sem) => setOpenSem(openSem === sem ? null : sem)

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="section-title">Riwayat Nilai</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nilai historis semester 1 s.d. 3</p>
        </div>
      </div>

      <div className="space-y-3">
        {riwayat.map((sem) => (
          <div key={sem.semester} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Semester header */}
            <button
              onClick={() => toggle(sem.semester)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                  sem.ips >= 3.5 ? 'bg-emerald-500' : sem.ips >= 3.0 ? 'bg-blue-500' : sem.ips >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {sem.semester}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{SEM_LABELS[sem.semester]}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{sem.sks} SKS diambil</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 dark:text-gray-500">IPS</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white tabular-nums">{sem.ips.toFixed(2)}</p>
                </div>
                {openSem === sem.semester ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Course details */}
            {openSem === sem.semester && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <span className="col-span-2">Kode</span>
                  <span className="col-span-6">Mata Kuliah</span>
                  <span className="col-span-1 text-center">SKS</span>
                  <span className="col-span-1 text-center">Nilai</span>
                  <span className="col-span-2 text-right">Angka</span>
                </div>
                {sem.nilai_matkul.map((mk) => (
                  <div
                    key={mk.kode}
                    className="grid grid-cols-12 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors items-center"
                  >
                    <span className="col-span-2">
                      <code className="text-xs font-mono text-gray-500 dark:text-gray-400">{mk.kode}</code>
                    </span>
                    <span className="col-span-6 text-sm text-gray-700 dark:text-gray-300 truncate pr-2">{mk.nama}</span>
                    <span className="col-span-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{mk.sks}</span>
                    <span className="col-span-1 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${GRADE_COLORS[mk.nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>
                        {mk.nilai_huruf}
                      </span>
                    </span>
                    <span className="col-span-2 text-right text-sm font-semibold text-gray-600 dark:text-gray-400 tabular-nums">
                      {mk.nilai_angka.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
