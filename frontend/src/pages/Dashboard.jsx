// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/pages/Dashboard.jsx
// DEVELOPER: Anak 7 (Frontend - Dashboard Page)
// DESKRIPSI: Halaman dashboard lengkap untuk satu mahasiswa.
//            Menampilkan profil, prediksi IPS/IPK, chart tren, simulasi SKS,
//            daftar matkul, riwayat nilai, catatan akademik, dan asisten target IPK.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, AlertCircle, TrendingUp, TrendingDown,
  Minus, Target, MessageSquare, Calendar, Award, Info,
  CheckSquare, BookOpen, ChevronDown, ChevronUp,
  History, User, GraduationCap, ListChecks, X, RotateCcw
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { getPredict } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import IPKTargetAssistant from '../components/IPKTargetAssistant'
import StudentCard from '../components/StudentCard'
import GradeHistoryTable from '../components/GradeHistoryTable'
import IPKChart from '../components/IPKChart'

// ─── KONSTANTA ────────────────────────────────────────────────────────
const PRODI_COLORS = {
  TI: 'from-indigo-500 to-blue-600',
  AK: 'from-emerald-500 to-teal-600',
  TM: 'from-orange-500 to-red-600',
  AP: 'from-violet-500 to-purple-600',
}

const GRADE_BADGE = {
  A:  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  AB: 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700',
  B:  'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  BC: 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700',
  C:  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  D:  'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
  E:  'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700',
}

const SKS_CONFIG = {
  24: { color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700', label: 'Beban Penuh' },
  23: { color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700', label: 'Beban Tinggi' },
  22: { color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700', label: 'Beban Normal' },
  21: { color: 'from-orange-500 to-red-600', bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700', label: 'Beban Ringan' },
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────
function getIPKColor(ipk) {
  if (ipk >= 3.5) return 'text-emerald-600 dark:text-emerald-400'
  if (ipk >= 3.0) return 'text-blue-600 dark:text-blue-400'
  if (ipk >= 2.5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getIPKBg(ipk) {
  if (ipk >= 3.5) return 'bg-emerald-500'
  if (ipk >= 3.0) return 'bg-blue-500'
  if (ipk >= 2.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

// ─── COMPONENTS ───────────────────────────────────────────────────────

function PredictionSummaryCards({ prediksi, currentIPK, selectedScenario }) {
  const st = prediksi.semester_target
  const ips = selectedScenario ? selectedScenario.prediksi_ips : prediksi.prediksi_ips
  const ipk = selectedScenario ? selectedScenario.prediksi_ipk : prediksi.prediksi_ipk_baru
  const recSks = selectedScenario ? selectedScenario.sks : prediksi.rekomendasi_sks
  const sksCfg = SKS_CONFIG[recSks] || SKS_CONFIG[22]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="card animate-slide-up">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Prediksi Semester {st}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-black tabular-nums ${getIPKColor(ips)}`}>{ips.toFixed(2)}</span>
          <span className="text-sm font-bold text-gray-400">IPS</span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-500">Prediksi IPK Baru</span>
            <span className="text-gray-900 dark:text-white">{ipk.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-500">Keyakinan</span>
            <span className="text-emerald-500">{(prediksi.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="mt-4 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 inline-flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Target Semester {st}</span>
        </div>
      </div>

      <div className={`card animate-slide-up ${sksCfg.bg} border ${sksCfg.border}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rekomendasi Beban SKS</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-black bg-gradient-to-r ${sksCfg.color} bg-clip-text text-transparent tabular-nums`}>{recSks}</span>
          <span className="text-sm font-bold text-gray-400">SKS</span>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sksCfg.text} ${sksCfg.bg} border ${sksCfg.border}`}>
            {sksCfg.label}
          </span>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${sksCfg.color}`} style={{ width: `${(recSks / 24) * 100}%` }} />
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{recSks} / 24 SKS MAKSIMUM</p>
        </div>
      </div>
    </div>
  )
}

function MatkulListModal({ scenario, onClose }) {
  if (!scenario) return null
  const cfg = SKS_CONFIG[scenario.sks] || SKS_CONFIG[22]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Daftar Matakuliah</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scenario.sks} SKS Terpilih</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total SKS</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{scenario.sks}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Prediksi IPS</p>
            <p className={`text-lg font-black ${getIPKColor(scenario.prediksi_ips)}`}>{scenario.prediksi_ips.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">IPK Baru</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{scenario.prediksi_ipk.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {scenario.matkul.map((mk) => (
            <div key={mk.kode} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{mk.nama}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{mk.kode} · {mk.wajib ? 'Wajib' : 'Pilihan'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{mk.sks} SKS</p>
                {mk.prediksi_nilai_huruf && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${GRADE_BADGE[mk.prediksi_nilai_huruf]}`}>
                    {mk.prediksi_nilai_huruf}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm transition-colors hover:bg-gray-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

function SKSScenarios({ scenarios, rekomendasi_sks, selectedSks, onSelectSks, onOpenPilihMatkul, isCustom, onReset }) {
  const [modalScenario, setModalScenario] = useState(null)

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="section-title">Simulasi SKS</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pilih skenario beban SKS untuk melihat proyeksi IPK Anda.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isCustom && (
            <button onClick={onReset} className="btn-secondary py-2 px-4 text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button onClick={onOpenPilihMatkul} className="btn-primary py-2 px-4 text-xs">
            <ListChecks className="w-3.5 h-3.5" /> Pilih Matakuliah
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Menggunakan pilihan matakuliah kustom. Klik Reset untuk kembali ke skenario rekomendasi.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc) => {
          const cfg = SKS_CONFIG[sc.sks] || SKS_CONFIG[22]
          const isRec = sc.sks === rekomendasi_sks
          const isSelected = !isCustom && sc.sks === selectedSks

          return (
            <button
              key={sc.sks}
              onClick={() => onSelectSks(sc.sks)}
              className={`rounded-2xl p-5 border-2 transition-all text-left relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                isSelected ? `${cfg.bg} ${cfg.border} ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900` : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-4xl font-black bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>{sc.sks}</span>
                {isRec && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[8px] font-black uppercase tracking-widest">
                    <Target className="w-2.5 h-2.5" /> Rekomendasi
                  </div>
                )}
                {isSelected && !isRec && (
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">SKS · {sc.matkul_count} matkul</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-500">IPS</span>
                  <span className={getIPKColor(sc.prediksi_ips)}>{sc.prediksi_ips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-gray-500">IPK</span>
                  <span className="text-gray-900 dark:text-white">{sc.prediksi_ipk.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
                  {cfg.label}
                </span>
                {sc.matkul?.length > 0 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setModalScenario(sc) }}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {modalScenario && <MatkulListModal scenario={modalScenario} onClose={() => setModalScenario(null)} />}
    </div>
  )
}

function PilihMatkulModal({ allCourses, currentIPK, cumSks, onConfirm, onClose }) {
  const MIN_SKS = 12
  const MAX_SKS = 24

  const wajibCourses = allCourses.filter(c => c.wajib)
  const pilihanCourses = allCourses.filter(c => !c.wajib)

  const [selected, setSelected] = useState(() => new Set(wajibCourses.map(c => c.kode)))

  const totalSks = useMemo(() => {
    return allCourses.filter(c => selected.has(c.kode)).reduce((s, c) => s + c.sks, 0)
  }, [selected, allCourses])

  const toggle = (kode, sks) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(kode)) {
        next.delete(kode)
      } else {
        if (totalSks + sks > MAX_SKS) return prev
        next.add(kode)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const chosenCourses = allCourses.filter(c => selected.has(c.kode))
    const totalPoin = chosenCourses.reduce((s, c) => s + (c.prediksi_nilai_angka || 0) * c.sks, 0)
    const ips = totalSks > 0 ? totalPoin / totalSks : 0
    const roundedIps = Math.round(ips * 100) / 100
    
    const totalSksNew = cumSks + totalSks
    const totalPoinNew = (cumSks * currentIPK) + (roundedIps * totalSks)
    const ipk = totalSksNew > 0 ? Math.min(4, Math.max(0, totalPoinNew / totalSksNew)) : roundedIps
    const roundedIpk = Math.round(ipk * 100) / 100

    onConfirm({
      sks: totalSks,
      prediksi_ips: roundedIps,
      prediksi_ipk: roundedIpk,
      matkul_count: chosenCourses.length,
      matkul: chosenCourses,
      isCustom: true
    })
  }

  const isValid = totalSks >= MIN_SKS && totalSks <= MAX_SKS
  const sksColor = totalSks < MIN_SKS || totalSks > MAX_SKS ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Pilih Matakuliah</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min {MIN_SKS} · Maks {MAX_SKS} SKS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Total SKS dipilih:</span>
          <span className={`text-2xl font-black tabular-nums ${sksColor}`}>{totalSks} / {MAX_SKS}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Matakuliah Wajib (Otomatis)</h4>
            {wajibCourses.map(c => (
              <div key={c.kode} className="flex items-center gap-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                <CheckSquare className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.nama}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.kode}</p>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{c.sks} SKS</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matakuliah Pilihan</h4>
            {pilihanCourses.map(c => {
              const isChecked = selected.has(c.kode)
              const wouldExceed = !isChecked && totalSks + c.sks > MAX_SKS
              return (
                <button
                  key={c.kode}
                  disabled={wouldExceed}
                  onClick={() => toggle(c.kode, c.sks)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${
                    isChecked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' : 
                    wouldExceed ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-40 cursor-not-allowed' :
                    'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-indigo-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isChecked && <span className="text-[10px] font-black">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.nama}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {c.kode} {c.prediksi_nilai_huruf ? `· Est. ${c.prediksi_nilai_huruf}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-black text-gray-600 dark:text-gray-400">{c.sks} SKS</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            {!isValid && (
              <p className="text-xs font-bold text-red-500">
                {totalSks < MIN_SKS ? `Minimal ${MIN_SKS} SKS` : `Maksimal ${MAX_SKS} SKS`}
              </p>
            )}
            {isValid && (
              <p className="text-xs font-bold text-emerald-600">
                {totalSks} SKS · {selected.size} matkul dipilih
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary py-2.5 px-4 text-sm">Batal</button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`btn-primary py-2.5 px-6 text-sm ${!isValid ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CurrentSemesterCourses({ riwayat, semesterTarget, selectedScenario }) {
  const lastSem = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null
  const matkul = selectedScenario?.matkul ?? lastSem?.nilai_matkul ?? []
  const totalSks = selectedScenario?.sks ?? lastSem?.sks ?? 0

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="section-title">Matakuliah Semester {semesterTarget}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{matkul.length} mata kuliah · {totalSks} SKS</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          Sedang Berjalan
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
        {matkul.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-400">Data semester aktif belum tersedia</p>
          </div>
        ) : (
          matkul.map((c) => {
            const nilaiHuruf = c.prediksi_nilai_huruf ?? c.nilai_huruf
            return (
              <div key={c.kode} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[10px] font-mono text-gray-400">{c.kode}</code>
                    <span className="text-gray-300 dark:text-gray-700">·</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.sks} SKS</span>
                    {c.wajib !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${c.wajib ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                        {c.wajib ? 'Wajib' : 'Pilihan'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{c.nama}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {nilaiHuruf ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black shadow-sm ${GRADE_BADGE[nilaiHuruf] || 'bg-gray-100 text-gray-700'}`}>
                        {nilaiHuruf}
                      </span>
                      {c.prediksi_nilai_angka && (
                        <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                          {c.prediksi_nilai_angka.toFixed(1)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest">
                      Berlangsung
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function AcademicNotes({ catatan }) {
  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="section-title">Catatan Akademik</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rekomendasi dan analisis performa</p>
        </div>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 mb-4">
        <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed italic font-medium">"{catatan}"</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
          Prediksi dihasilkan berdasarkan data historis menggunakan algoritma weighted average (Sem3:50%, Sem2:30%, Sem1:20%). 
          Hasil bersifat estimasi untuk membantu perencanaan akademik Anda secara mandiri.
        </p>
      </div>
    </div>
  )
}

function GraduationPage({ data }) {
  const prodi_color = PRODI_COLORS[data.prodi_key] || 'from-indigo-500 to-purple-600'
  const ipk = data.ipk_kumulatif

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
        <Link to="/" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
        <span>/</span>
        <span className="text-indigo-600 font-mono">{data.nim}</span>
      </div>

      <div className={`h-2 rounded-full bg-gradient-to-r ${prodi_color} mb-8 shadow-sm`} />

      <div className="card text-center py-12 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${prodi_color} opacity-5 blur-3xl`} />
        
        <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${prodi_color} flex items-center justify-center text-white mx-auto mb-6 shadow-2xl rotate-3`}>
          <GraduationCap className="w-12 h-12 -rotate-3" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
          <Award className="w-4 h-4" /> LULUS
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{data.nama}</h2>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8">
          {data.nim} · {data.prodi} · Angkatan {data.angkatan}
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">IPK Kumulatif</p>
            <p className="text-2xl font-black text-emerald-600">{ipk.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Masa Studi</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{data.riwayat_semester.length} Semester</p>
          </div>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            <span>Progress IPK</span>
            <span>{ipk.toFixed(2)} / 4.00</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full ${getIPKBg(ipk)} transition-all duration-1000`} style={{ width: `${(ipk / 4) * 100}%` }} />
          </div>
        </div>

        <Link to="/" className="btn-primary py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-sm inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
        </Link>
      </div>

      <div className="mt-8">
        <GradeHistoryTable riwayat={data.riwayat_semester} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { nim } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSks, setSelectedSks] = useState(null)
  const [customScenario, setCustomScenario] = useState(null)
  const [showPilihMatkul, setShowPilihMatkul] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    setCustomScenario(null)
    setSelectedSks(null)
    try {
      const result = await getPredict(nim)
      setData(result)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (nim) fetchData()
  }, [nim])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20">
        <LoadingSpinner message="Memuat data dan menghitung prediksi akademik..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="card p-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-6 shadow-lg rotate-3">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">{error}</p>
          <div className="flex gap-3">
            <Link to="/" className="btn-secondary py-3 px-6 rounded-2xl text-sm font-bold">Kembali</Link>
            <button onClick={fetchData} className="btn-primary py-3 px-6 rounded-2xl text-sm font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null
  if (data.status === 'lulus') return <GraduationPage data={data} />

  const { prediksi, riwayat_semester, ...student } = data
  const prodi_key = data.prodi_key

  const effectiveSks = selectedSks ?? prediksi?.rekomendasi_sks
  const selectedScenario = customScenario
    ?? prediksi?.sks_scenarios?.find(s => s.sks === effectiveSks)
    ?? null
  
  const cumSks = riwayat_semester.reduce((s, sem) => s + sem.sks, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest flex-wrap">
        <Link to="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Beranda
        </Link>
        <span className="text-gray-200">/</span>
        <span className="hidden sm:inline">Dashboard</span>
        <span className="hidden sm:inline text-gray-200">/</span>
        <span className="text-indigo-600 font-mono tabular-nums">{nim}</span>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated: {new Date(data.generated_at).toLocaleDateString()}</span>
          </div>
          <button onClick={fetchData} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`h-2 rounded-full bg-gradient-to-r ${PRODI_COLORS[prodi_key] || 'from-indigo-500 to-purple-600'} mb-8 shadow-sm`} />

      <div className="space-y-6">
        <StudentCard student={student} />

        <PredictionSummaryCards 
          prediksi={prediksi} 
          currentIPK={student.ipk_kumulatif} 
          selectedScenario={selectedScenario} 
        />

        <IPKChart 
          riwayat={riwayat_semester}
          prediksiIPS={selectedScenario?.prediksi_ips ?? prediksi.prediksi_ips}
          prediksiIPK={selectedScenario?.prediksi_ipk ?? prediksi.prediksi_ipk_baru}
          semesterTarget={prediksi.semester_target}
        />

        {prediksi.sks_scenarios && prediksi.sks_scenarios.length > 0 && (
          <SKSScenarios
            scenarios={prediksi.sks_scenarios}
            rekomendasi_sks={prediksi.rekomendasi_sks}
            selectedSks={effectiveSks}
            onSelectSks={(sks) => { setSelectedSks(sks); setCustomScenario(null) }}
            onOpenPilihMatkul={() => setShowPilihMatkul(true)}
            isCustom={!!customScenario}
            onReset={() => { setCustomScenario(null); setSelectedSks(null) }}
          />
        )}

        {showPilihMatkul && prediksi.all_semester_courses && (
          <PilihMatkulModal
            allCourses={prediksi.all_semester_courses}
            currentIPK={student.ipk_kumulatif}
            cumSks={cumSks}
            onConfirm={(scenario) => { setCustomScenario(scenario); setShowPilihMatkul(false) }}
            onClose={() => setShowPilihMatkul(false)}
          />
        )}

        <CurrentSemesterCourses 
          riwayat={riwayat_semester}
          semesterTarget={prediksi.semester_target}
          selectedScenario={selectedScenario}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <IPKTargetAssistant 
              nim={nim}
              riwayatSemester={riwayat_semester}
              semesterAktif={student.semester_aktif}
              currentIPK={student.ipk_kumulatif}
              prediksiIPK={prediksi.prediksi_ipk_baru}
            />
            <GradeHistoryTable riwayat={riwayat_semester} />
          </div>
          <div className="space-y-6">
            <AcademicNotes catatan={prediksi.catatan_akademik} />
            
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="section-title">Ringkasan Performa</h3>
              </div>
              <div className="space-y-4">
                {riwayat_semester.map((sem) => {
                  let colorClass = 'from-red-400 to-rose-500'
                  if (sem.ips >= 3.5) colorClass = 'from-emerald-400 to-green-500'
                  else if (sem.ips >= 3.0) colorClass = 'from-blue-400 to-indigo-500'
                  else if (sem.ips >= 2.5) colorClass = 'from-yellow-400 to-amber-500'

                  return (
                    <div key={sem.semester} className="flex items-center gap-4">
                      <span className="w-24 text-[10px] font-black uppercase tracking-widest text-gray-500">Semester {sem.semester}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-50 dark:border-gray-800/50">
                        <div className={`h-full rounded-full bg-gradient-to-r ${colorClass}`} style={{ width: `${(sem.ips / 4) * 100}%` }} />
                      </div>
                      <span className="w-10 text-right text-sm font-black text-gray-700 dark:text-gray-300 tabular-nums">{sem.ips.toFixed(2)}</span>
                    </div>
                  )
                })}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-[10px] font-black uppercase tracking-widest text-indigo-600">Prediksi S{prediksi.semester_target}</span>
                    <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full h-2 overflow-hidden border border-indigo-100 dark:border-indigo-800/50">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${((selectedScenario?.prediksi_ips ?? prediksi.prediksi_ips) / 4) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-black text-indigo-600 tabular-nums">{(selectedScenario?.prediksi_ips ?? prediksi.prediksi_ips).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center py-10 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
            Data bersifat sintetis untuk keperluan demonstrasi sistem · AcadPredict 2026
          </p>
        </footer>
      </div>
    </div>
  )
}
