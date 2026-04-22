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

// ─── Constants ─────────────────────────────────────────────────────────────

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
  BC: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  C:  'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
  D:  'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700',
  E:  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600',
}

const SKS_CONFIG = {
  24: { color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', label: 'Beban Penuh' },
  23: { color: 'from-blue-500 to-indigo-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-300 dark:border-blue-700',       text: 'text-blue-700 dark:text-blue-300',       label: 'Beban Tinggi' },
  22: { color: 'from-yellow-500 to-amber-600',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',   border: 'border-yellow-300 dark:border-yellow-700',   text: 'text-yellow-700 dark:text-yellow-300',   label: 'Beban Normal' },
  21: { color: 'from-orange-500 to-red-500',    bg: 'bg-orange-50 dark:bg-orange-900/20',   border: 'border-orange-300 dark:border-orange-700',   text: 'text-orange-700 dark:text-orange-300',   label: 'Beban Ringan' },
}

// ─── Helper functions ────────────────────────────────────────────────────────

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

function getInitials(nama) {
  return nama.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// ─── Section 1: Student Profile Card ────────────────────────────────────────

function StudentProfileCard({ student, prediksi }) {
  const ipk = student.ipk_kumulatif
  const trend = prediksi?.trend || 'stabil'
  const trendConfig = {
    meningkat: { icon: TrendingUp, label: 'Tren Meningkat', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' },
    menurun: { icon: TrendingDown, label: 'Tren Menurun', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700' },
    stabil: { icon: Minus, label: 'Tren Stabil', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700' },
  }
  const tc = trendConfig[trend] || trendConfig.stabil
  const TrendIcon = tc.icon
  const prodi_color = PRODI_COLORS[student.prodi_key] || 'from-indigo-500 to-purple-600'

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${prodi_color} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <span className="text-white font-extrabold text-lg sm:text-xl">{getInitials(student.nama)}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white truncate">{student.nama}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${prodi_color} text-white flex-shrink-0`}>
              {student.prodi_key}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{student.nim}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {student.jenis_kelamin === 'L' ? 'Laki-laki' : student.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
            </span>
            <span className="hidden sm:inline">{student.prodi}</span>
            <span>Angkatan {student.angkatan}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400">Semester Aktif:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{student.semester_aktif}</span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold ${tc.cls}`}>
            <TrendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {tc.label}
          </div>
        </div>
      </div>

      {/* IPK progress bar */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">IPK Kumulatif</span>
          <span className={`text-lg font-extrabold tabular-nums ${getIPKColor(ipk)}`}>
            {ipk.toFixed(2)} / 4.00
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full ${getIPKBg(ipk)} transition-all duration-700`}
            style={{ width: `${(ipk / 4.0) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0.00</span>
          <span>2.00</span>
          <span>3.00</span>
          <span>3.50</span>
          <span>4.00</span>
        </div>
      </div>
    </div>
  )
}

// ─── Section 2: Prediction Summary ──────────────────────────────────────────

function PredictionSummaryCards({ prediksi, currentIPK, selectedScenario }) {
  const st = prediksi.semester_target
  const ips = selectedScenario ? selectedScenario.prediksi_ips : prediksi.prediksi_ips
  const ipk = selectedScenario ? selectedScenario.prediksi_ipk : prediksi.prediksi_ipk_baru
  const recSks = selectedScenario ? selectedScenario.sks : prediksi.rekomendasi_sks
  const conf = prediksi.confidence
  const sksCfg = SKS_CONFIG[recSks] || SKS_CONFIG[22]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card A: Predicted IPS */}
      <div className="card animate-slide-up">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Prediksi Semester {st} (Sedang Berjalan)
        </p>
        <div className="flex items-end gap-3 mb-3">
          <span className={`text-5xl font-extrabold tabular-nums ${getIPKColor(ips)}`}>
            {ips.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400 mb-1.5">IPS</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Prediksi IPK Baru:</span>
          <span className={`font-bold tabular-nums ${getIPKColor(ipk)}`}>{ipk.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-500 dark:text-gray-400">Keyakinan:</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{conf}%</span>
        </div>
        <div className="mt-3 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Semester {st}</span>
        </div>
      </div>

      {/* Card B: SKS recommendation */}
      <div className={`card animate-slide-up ${sksCfg.bg} border ${sksCfg.border}`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Rekomendasi SKS
        </p>
        <div className="flex items-end gap-3 mb-3">
          <span className={`text-5xl font-extrabold tabular-nums bg-gradient-to-r ${sksCfg.color} bg-clip-text text-transparent`}>
            {recSks}
          </span>
          <span className="text-sm text-gray-400 mb-1.5">SKS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sksCfg.text} ${sksCfg.bg} border ${sksCfg.border}`}>
            {sksCfg.label}
          </span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${sksCfg.color} transition-all duration-700`}
              style={{ width: `${(recSks / 24) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{recSks} / 24 SKS maksimum</p>
        </div>
      </div>
    </div>
  )
}

// ─── Section 3: IPS/IPK Trend Chart ─────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isPred = label?.toString().includes('Prediksi')
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: <span className="tabular-nums">{Number(p.value).toFixed(2)}</span>
          </p>
        ))}
        {isPred && <p className="text-xs text-amber-500 mt-1 italic">* Nilai prediksi</p>}
      </div>
    )
  }
  return null
}

function TrendChart({ riwayat, prediksiIPS, prediksiIPK, semesterTarget, selectedScenario }) {
  const displayIPS = selectedScenario ? selectedScenario.prediksi_ips : prediksiIPS
  const displayIPK = selectedScenario ? selectedScenario.prediksi_ipk : prediksiIPK

  const data = []
  let cumSks = 0
  let cumPoints = 0
  riwayat.forEach((sem) => {
    cumSks += sem.sks
    cumPoints += sem.ips * sem.sks
    data.push({
      name: `Semester ${sem.semester}`,
      IPS: sem.ips,
      IPK: parseFloat((cumPoints / cumSks).toFixed(2)),
    })
  })
  data.push({
    name: `Sem ${semesterTarget} (Prediksi)`,
    IPS: displayIPS,
    IPK: displayIPK,
    isPredicted: true,
  })

  const trend = riwayat.length >= 2
    ? riwayat[riwayat.length - 1].ips - riwayat[riwayat.length - 2].ips
    : 0
  const TrendIcon = trend > 0.05 ? TrendingUp : trend < -0.05 ? TrendingDown : Minus
  const trendColor = trend > 0.05 ? 'text-emerald-600 dark:text-emerald-400' : trend < -0.05 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
  const trendLabel = trend > 0.05 ? 'Meningkat' : trend < -0.05 ? 'Menurun' : 'Stabil'

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title">Tren Performa Akademik</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">IPS & IPK per semester</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{trendLabel}</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="ipsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ipkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <ReferenceLine
              x={`Sem ${semesterTarget} (Prediksi)`}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Prediksi', position: 'top', fontSize: 10, fill: '#f59e0b' }}
            />
            <Area type="monotone" dataKey="IPS" stroke="#6366f1" strokeWidth={2.5} fill="url(#ipsGrad)"
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="IPK" stroke="#a855f7" strokeWidth={2.5} fill="url(#ipkGrad)"
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">IPS per semester</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">IPK kumulatif</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-400" />
          <span className="text-xs text-amber-600 dark:text-amber-400">Nilai prediksi</span>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Daftar Matkul SKS ─────────────────────────────────────────────────

function MatkulListModal({ scenario, onClose }) {
  if (!scenario) return null
  const cfg = SKS_CONFIG[scenario.sks] || SKS_CONFIG[22]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Daftar Matakuliah</h3>
              <p className={`text-xs font-semibold ${cfg.text}`}>{scenario.sks} SKS · {cfg.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-400">Total SKS</p>
            <p className={`text-lg font-extrabold tabular-nums bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>{scenario.sks}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Prediksi IPS</p>
            <p className={`text-lg font-extrabold tabular-nums ${getIPKColor(scenario.prediksi_ips)}`}>{scenario.prediksi_ips.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">IPK Baru</p>
            <p className={`text-lg font-extrabold tabular-nums ${getIPKColor(scenario.prediksi_ipk)}`}>{scenario.prediksi_ipk.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {scenario.matkul?.map((mk) => (
            <div key={mk.kode} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{mk.nama}</p>
                <p className="text-xs text-gray-400">{mk.kode} · {mk.wajib ? 'Wajib' : 'Pilihan'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{mk.sks} SKS</p>
                {mk.prediksi_nilai_huruf && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${GRADE_BADGE[mk.prediksi_nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>
                    {mk.prediksi_nilai_huruf}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="w-full py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section 4: SKS Scenario Comparison ─────────────────────────────────────

function SKSScenarios({ scenarios, rekomendasi_sks, selectedSks, onSelectSks, onOpenPilihMatkul, isCustom, onReset }) {
  const [modalScenario, setModalScenario] = useState(null)

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="section-title">Simulasi SKS — Jika Anda Mengambil...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Klik kartu untuk memilih skenario, klik ikon daftar untuk lihat matakuliah</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCustom && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
          <button
            onClick={onOpenPilihMatkul}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow transition-all"
          >
            <ListChecks className="w-3.5 h-3.5" />
            Pilih Matakuliah
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Menggunakan pilihan matakuliah kustom. Klik Reset untuk kembali ke rekomendasi sistem.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const cfg = SKS_CONFIG[sc.sks] || SKS_CONFIG[22]
          const isRec = sc.sks === rekomendasi_sks
          const isSelected = !isCustom && sc.sks === selectedSks
          return (
            <button
              key={sc.sks}
              onClick={() => onSelectSks(sc.sks)}
              className={`rounded-2xl p-4 border-2 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isSelected
                  ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg`
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {isRec && (
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Rekomendasi
                </div>
              )}
              {isSelected && !isRec && (
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Dipilih
                </div>
              )}
              <div className={`text-4xl font-extrabold tabular-nums mb-0.5 bg-gradient-to-r ${cfg.color} bg-clip-text text-transparent`}>
                {sc.sks}
              </div>
              <div className="text-xs text-gray-400 mb-3">SKS · {sc.matkul_count} matkul</div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Prediksi IPS</span>
                  <span className={`font-bold tabular-nums ${getIPKColor(sc.prediksi_ips)}`}>{sc.prediksi_ips.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">IPK Baru</span>
                  <span className={`font-bold tabular-nums ${getIPKColor(sc.prediksi_ipk)}`}>{sc.prediksi_ipk.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.text} ${cfg.bg}`}>
                  {cfg.label}
                </span>
                {sc.matkul?.length > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setModalScenario(sc) }}
                    className="flex items-center gap-0.5 text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lihat</span>
                  </button>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {modalScenario && (
        <MatkulListModal scenario={modalScenario} onClose={() => setModalScenario(null)} />
      )}
    </div>
  )
}

// ─── Modal Pilih Matakuliah ───────────────────────────────────────────────────

const MIN_SKS = 12
const MAX_SKS = 24

function PilihMatkulModal({ allCourses, currentIPK, cumSks, onConfirm, onClose }) {
  const wajibCourses = allCourses.filter(c => c.wajib)
  const pilihanCourses = allCourses.filter(c => !c.wajib)
  const wajibSks = wajibCourses.reduce((s, c) => s + c.sks, 0)

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
        const newTotal = totalSks + sks
        if (newTotal > MAX_SKS) return prev
        next.add(kode)
      }
      return next
    })
  }

  const isValid = totalSks >= MIN_SKS && totalSks <= MAX_SKS

  const handleConfirm = () => {
    const chosenCourses = allCourses.filter(c => selected.has(c.kode))
    const ips = totalSks > 0
      ? chosenCourses.reduce((s, c) => s + c.prediksi_nilai_angka * c.sks, 0) / totalSks
      : 0
    const roundedIps = Math.round(ips * 100) / 100
    const totalSksNew = cumSks + totalSks
    const ipk = totalSksNew > 0
      ? Math.min(4, Math.max(0, Math.round(((cumSks * currentIPK + roundedIps * totalSks) / totalSksNew) * 100) / 100))
      : roundedIps
    onConfirm({
      sks: totalSks,
      prediksi_ips: roundedIps,
      prediksi_ipk: ipk,
      matkul_count: chosenCourses.length,
      matkul: chosenCourses,
      isCustom: true,
    })
  }

  const sksColor = totalSks < MIN_SKS ? 'text-red-500' : totalSks > MAX_SKS ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pilih Matakuliah KRS</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Min {MIN_SKS} · Maks {MAX_SKS} SKS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* SKS Counter */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total SKS dipilih:</span>
          <span className={`text-xl font-extrabold tabular-nums ${sksColor}`}>
            {totalSks} <span className="text-sm font-normal text-gray-400">/ {MAX_SKS}</span>
          </span>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {/* Wajib */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Matakuliah Wajib (otomatis terpilih)</p>
            <div className="space-y-1.5">
              {wajibCourses.map(c => (
                <div key={c.kode} className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                  <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.nama}</p>
                    <p className="text-xs text-gray-400">{c.kode}</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">{c.sks} SKS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pilihan */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Matakuliah Pilihan</p>
            <div className="space-y-1.5">
              {pilihanCourses.map(c => {
                const isChecked = selected.has(c.kode)
                const wouldExceed = !isChecked && totalSks + c.sks > MAX_SKS
                return (
                  <button
                    key={c.kode}
                    onClick={() => toggle(c.kode, c.sks)}
                    disabled={wouldExceed}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                        : wouldExceed
                        ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50 opacity-40 cursor-not-allowed'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                      isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.nama}</p>
                      <p className="text-xs text-gray-400">{c.kode} · Prediksi: {c.prediksi_nilai_huruf}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">{c.sks} SKS</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalSks < MIN_SKS && <span className="text-red-500">Minimal {MIN_SKS} SKS</span>}
            {totalSks > MAX_SKS && <span className="text-red-500">Maksimal {MAX_SKS} SKS</span>}
            {isValid && <span className="text-emerald-600 dark:text-emerald-400">{totalSks} SKS · {selected.size} matkul</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow'
                  : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }`}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 5: Current Semester Courses ────────────────────────────────────

function CurrentSemesterCourses({ riwayat, semesterTarget, selectedScenario }) {
  const lastSem = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null

  // Ambil matkul dari scenario yang dipilih jika ada, fallback ke riwayat terakhir
  const matkul = selectedScenario?.matkul ?? lastSem?.nilai_matkul ?? []
  const totalSks = selectedScenario?.sks ?? lastSem?.sks ?? 0

  if (!matkul.length) {
    return (
      <div className="card animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="section-title">Matakuliah Semester {semesterTarget} (Sedang Berjalan)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Data semester aktif belum tersedia</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="section-title">Matakuliah Semester {semesterTarget} (Sedang Berjalan)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{matkul.length} mata kuliah · {totalSks} SKS</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{totalSks} SKS</span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {matkul.map((c) => {
          // Support both format: dari scenario (prediksi_nilai_huruf) dan riwayat (nilai_huruf)
          const nilaiHuruf = c.prediksi_nilai_huruf ?? c.nilai_huruf
          return (
            <div key={c.kode} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <code className="text-xs font-mono text-gray-400 dark:text-gray-500">{c.kode}</code>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{c.sks} SKS</span>
                  {c.wajib !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      c.wajib ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>{c.wajib ? 'Wajib' : 'Pilihan'}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{c.nama}</p>
              </div>
              {nilaiHuruf ? (
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${GRADE_BADGE[nilaiHuruf] || 'bg-gray-100 text-gray-700'}`}>
                    {nilaiHuruf}
                  </span>
                  {c.prediksi_nilai_angka !== undefined && (
                    <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{c.prediksi_nilai_angka.toFixed(1)}</p>
                  )}
                </div>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                  Berlangsung
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section 6: Grade History ────────────────────────────────────────────────

const GRADE_COLORS = {
  A: 'grade-A', AB: 'grade-AB', B: 'grade-B', BC: 'grade-BC',
  C: 'grade-C', D: 'grade-D', E: 'grade-E',
}

function GradeHistory({ riwayat }) {
  const [openSem, setOpenSem] = useState(riwayat.length > 0 ? riwayat[riwayat.length - 1].semester : null)

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
          <History className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="section-title">Riwayat Nilai</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Nilai historis semester 1 s.d. {riwayat.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {riwayat.map((sem) => (
          <div key={sem.semester} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenSem(openSem === sem.semester ? null : sem.semester)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                  sem.ips >= 3.5 ? 'bg-emerald-500' : sem.ips >= 3.0 ? 'bg-blue-500' : sem.ips >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {sem.semester}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Semester {sem.semester}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{sem.sks} SKS · {sem.nilai_matkul.length} matkul</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">IPS</p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white tabular-nums">{sem.ips.toFixed(2)}</p>
                </div>
                {openSem === sem.semester ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {openSem === sem.semester && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {/* Desktop header */}
                <div className="hidden sm:grid grid-cols-12 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span className="col-span-2">Kode</span>
                  <span className="col-span-6">Mata Kuliah</span>
                  <span className="col-span-1 text-center">SKS</span>
                  <span className="col-span-1 text-center">Nilai</span>
                  <span className="col-span-2 text-right">Angka</span>
                </div>
                {sem.nilai_matkul.map((mk) => (
                  <div key={mk.kode}>
                    {/* Desktop row */}
                    <div className="hidden sm:grid grid-cols-12 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors items-center">
                      <span className="col-span-2"><code className="text-xs font-mono text-gray-500 dark:text-gray-400">{mk.kode}</code></span>
                      <span className="col-span-6 text-sm text-gray-700 dark:text-gray-300 truncate pr-2">{mk.nama}</span>
                      <span className="col-span-1 text-center text-xs font-medium text-gray-500">{mk.sks}</span>
                      <span className="col-span-1 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${GRADE_COLORS[mk.nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>{mk.nilai_huruf}</span>
                      </span>
                      <span className="col-span-2 text-right text-sm font-semibold text-gray-600 dark:text-gray-400 tabular-nums">{mk.nilai_angka.toFixed(1)}</span>
                    </div>
                    {/* Mobile row */}
                    <div className="sm:hidden flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">{mk.nama}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{mk.sks} SKS</p>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${GRADE_COLORS[mk.nilai_huruf] || 'bg-gray-100 text-gray-700'}`}>{mk.nilai_huruf}</span>
                    </div>
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

// ─── Section 7: Academic Notes ───────────────────────────────────────────────

function AcademicNotes({ catatan }) {
  return (
    <div className="card animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="section-title">Catatan Akademik</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rekomendasi dan analisis performa</p>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{catatan}</p>
      </div>
      <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
          Prediksi dihasilkan berdasarkan data historis menggunakan algoritma weighted average
          (Sem3:50%, Sem2:30%, Sem1:20%). Hasil bersifat estimasi. Untuk diskusi lebih lanjut,
          silakan konsultasikan dengan dosen pembimbing akademik.
        </p>
      </div>
    </div>
  )
}

// ─── Graduation Page ────────────────────────────────────────────────────────

function GraduationPage({ data }) {
  const prodi_color = PRODI_COLORS[data.prodi_key] || 'from-indigo-500 to-purple-600'
  const ipk = data.ipk_kumulatif

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{data.nim}</span>
      </div>

      <div className={`h-1.5 rounded-full bg-gradient-to-r ${prodi_color} mb-6`} />

      <div className="card text-center">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${prodi_color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <GraduationCap className="w-10 h-10 text-white" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-4">
          <Award className="w-4 h-4" />
          LULUS
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{data.nama}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{data.nim}</span>
          {' · '}{data.prodi}{' · '}Angkatan {data.angkatan}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">IPK Kumulatif</p>
            <p className={`text-3xl font-extrabold tabular-nums ${getIPKColor(ipk)}`}>{ipk.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-0.5">dari 4.00</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Semester Ditempuh</p>
            <p className="text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">{data.semester_aktif}</p>
            <p className="text-xs text-gray-400 mt-0.5">semester</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${getIPKBg(ipk)} transition-all duration-700`}
            style={{ width: `${(ipk / 4.0) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-6">Progres IPK</p>

        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      {data.riwayat_semester && data.riwayat_semester.length > 0 && (
        <div className="mt-6">
          <GradeHistory riwayat={data.riwayat_semester} />
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

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

  useEffect(() => { fetchData() }, [nim])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <LoadingSpinner message="Memuat data dan menghitung prediksi..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="card">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <button onClick={fetchData} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  if (data.status === 'lulus') {
    return <GraduationPage data={data} />
  }

  const { prediksi, riwayat_semester, ...student } = data
  const prodi_key = data.prodi_key

  const effectiveSks = selectedSks ?? prediksi?.rekomendasi_sks
  const selectedScenario = customScenario
    ?? prediksi?.sks_scenarios?.find(s => s.sks === effectiveSks)
    ?? null

  const cumSks = riwayat_semester.reduce((s, sem) => s + sem.sks, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-5 sm:mb-6 flex-wrap">
        <Link to="/" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Beranda
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Dashboard</span>
        <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">/</span>
        <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[100px] sm:max-w-none">{nim}</span>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {prediksi?.generated_at}
          </span>
          <button onClick={fetchData} className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Top gradient accent bar */}
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${PRODI_COLORS[prodi_key] || 'from-indigo-500 to-purple-600'} mb-6`} />

      {/* Section 1: Student Profile */}
      <div className="mb-6">
        <StudentProfileCard student={student} prediksi={prediksi} />
      </div>

      {/* Section 2: Prediction Summary (2 cards) */}
      <div className="mb-6">
        <PredictionSummaryCards prediksi={prediksi} currentIPK={student.ipk_kumulatif} selectedScenario={selectedScenario} />
      </div>

      {/* Section 3: Trend Chart */}
      <div className="mb-6">
        <TrendChart
          riwayat={riwayat_semester}
          prediksiIPS={prediksi.prediksi_ips}
          prediksiIPK={prediksi.prediksi_ipk_baru}
          semesterTarget={prediksi.semester_target}
          selectedScenario={selectedScenario}
        />
      </div>

      {/* Section 4: SKS Scenarios */}
      {prediksi.sks_scenarios && prediksi.sks_scenarios.length > 0 && (
        <div className="mb-6">
          <SKSScenarios
            scenarios={prediksi.sks_scenarios}
            rekomendasi_sks={prediksi.rekomendasi_sks}
            selectedSks={effectiveSks}
            onSelectSks={(sks) => { setSelectedSks(sks); setCustomScenario(null) }}
            onOpenPilihMatkul={() => setShowPilihMatkul(true)}
            isCustom={!!customScenario}
            onReset={() => { setCustomScenario(null); setSelectedSks(null) }}
          />
        </div>
      )}

      {/* Modal Pilih Matakuliah */}
      {showPilihMatkul && prediksi.all_semester_courses && (
        <PilihMatkulModal
          allCourses={prediksi.all_semester_courses}
          currentIPK={student.ipk_kumulatif}
          cumSks={cumSks}
          onConfirm={(scenario) => { setCustomScenario(scenario); setShowPilihMatkul(false) }}
          onClose={() => setShowPilihMatkul(false)}
        />
      )}

      {/* Section 5: Current Semester Courses */}
      <div className="mb-6">
        <CurrentSemesterCourses
          riwayat={riwayat_semester}
          semesterTarget={prediksi.semester_target}
          selectedScenario={selectedScenario}
        />
      </div>

      {/* Section 6 + 7: Grade History + Academic Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-6">
          {/* Asisten Target IPK — di atas riwayat nilai */}
          <IPKTargetAssistant
            nim={nim}
            riwayatSemester={riwayat_semester}
            semesterAktif={student.semester_aktif}
            currentIPK={student.ipk_kumulatif}
            prediksiIPK={prediksi.prediksi_ipk_baru}
          />
          <GradeHistory riwayat={riwayat_semester} />
        </div>
        <div className="space-y-6">
          <AcademicNotes catatan={prediksi.catatan_akademik} />

          {/* Quick performance summary */}
          <div className="card">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Ringkasan Performa
            </h3>
            <div className="space-y-3">
              {riwayat_semester.map((sem) => (
                <div key={sem.semester} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Semester {sem.semester}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        sem.ips >= 3.5 ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                          : sem.ips >= 3.0 ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          : sem.ips >= 2.5 ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                          : 'bg-gradient-to-r from-red-400 to-rose-500'
                      }`}
                      style={{ width: `${(sem.ips / 4.0) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                    {sem.ips.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="w-24 text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  Prediksi Sem {prediksi.semester_target} (Aktif)
                </span>
                <div className="flex-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700"
                    style={{ width: `${((selectedScenario ? selectedScenario.prediksi_ips : prediksi.prediksi_ips) / 4.0) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {(selectedScenario ? selectedScenario.prediksi_ips : prediksi.prediksi_ips).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Data bersifat sintetis untuk keperluan demonstrasi sistem · AcadPredict 2024
        </p>
      </div>
    </div>
  )
}
