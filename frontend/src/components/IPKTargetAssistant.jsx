import { useState } from 'react'
import { Target, ChevronRight, ChevronLeft, Loader2, CheckCircle, AlertTriangle, XCircle, Sparkles, BarChart2, BookOpen, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { postIPKTarget } from '../api/client'

// ─── Wizard Steps ────────────────────────────────────────────────────────────

const STEPS = ['Target IPK', 'Kebiasaan Belajar', 'Gaya Belajar', 'Mata Kuliah Sulit', 'Hasil']

const KEBIASAAN_OPTIONS = [
  { value: 'rutin', label: 'Rutin setiap hari', desc: 'Belajar terjadwal & konsisten' },
  { value: 'kadang', label: 'Kadang-kadang', desc: 'Belajar saat ada tugas/ujian' },
  { value: 'jarang', label: 'Jarang', desc: 'Belajar hanya menjelang ujian' },
]

const GAYA_OPTIONS = [
  { value: 'visual', label: 'Visual', desc: 'Diagram, mind map, video' },
  { value: 'membaca', label: 'Membaca & Mencatat', desc: 'Buku, ringkasan, catatan' },
  { value: 'diskusi', label: 'Diskusi', desc: 'Kelompok belajar, tanya jawab' },
  { value: 'praktek', label: 'Praktek Langsung', desc: 'Soal latihan, proyek, lab' },
]

// ─── Validation Badge ─────────────────────────────────────────────────────────

function ValidasiBadge({ validasi }) {
  const cfg = {
    realistis: { icon: CheckCircle, cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' },
    ambisius: { icon: AlertTriangle, cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
    tidak_mungkin: { icon: XCircle, cls: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' },
    tidak_valid: { icon: XCircle, cls: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' },
  }
  const c = cfg[validasi.status] || cfg.ambisius
  const Icon = c.icon
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border ${c.cls}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-sm">{validasi.label}</p>
        <p className="text-xs mt-0.5 opacity-90">{validasi.pesan}</p>
      </div>
    </div>
  )
}

// ─── Proyeksi Chart ───────────────────────────────────────────────────────────

function ProyeksiChart({ proyeksi, targetIPK, currentIPK, semesterAktif }) {
  const data = [
    { name: `Sem ${semesterAktif - 1}`, ipk: currentIPK },
    ...proyeksi.map(r => ({ name: `Sem ${semesterAktif + r.semester_ke - 1}`, ipk: r.ipk_proyeksi })),
  ]
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[Math.max(0, currentIPK - 0.5), 4.0]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => [v.toFixed(2), 'IPK Proyeksi']} />
          <ReferenceLine y={targetIPK} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: `Target ${targetIPK}`, position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          <Line type="monotone" dataKey="ipk" stroke="#6366f1" strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IPKTargetAssistant({ nim, riwayatSemester, semesterAktif, currentIPK, prediksiIPK }) {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Form state
  const [targetIPK, setTargetIPK] = useState('')
  const [targetError, setTargetError] = useState('')
  const [kebiasaan, setKebiasaan] = useState('')
  const [gaya, setGaya] = useState('')
  const [matkulTersulit, setMatkulTersulit] = useState([])
  const [bebanSKS, setBebanSKS] = useState(22)

  // Collect all matkul from riwayat for selection
  const allMatkul = []
  const seen = new Set()
  riwayatSemester?.forEach(sem => {
    sem.nilai_matkul?.forEach(mk => {
      if (!seen.has(mk.kode)) {
        seen.add(mk.kode)
        allMatkul.push(mk)
      }
    })
  })

  const toggleMatkul = (kode) => {
    setMatkulTersulit(prev =>
      prev.includes(kode) ? prev.filter(k => k !== kode) : prev.length < 5 ? [...prev, kode] : prev
    )
  }

  const validateTarget = (val) => {
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0) return 'Masukkan angka yang valid'
    if (num > 4.0) return 'IPK maksimum adalah 4.00'
    if (num < currentIPK - 0.5) return 'Target terlalu rendah dari IPK saat ini'
    return ''
  }

  const canNext = () => {
    if (step === 0) return !validateTarget(targetIPK)
    if (step === 1) return !!kebiasaan
    if (step === 2) return !!gaya
    if (step === 3) return true
    return false
  }

  const handleNext = () => {
    if (step === 0) {
      const err = validateTarget(targetIPK)
      if (err) { setTargetError(err); return }
      setTargetError('')
    }
    if (step === 3) {
      handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setStep(4)
    try {
      const res = await postIPKTarget(nim, {
        target_ipk: parseFloat(targetIPK),
        kebiasaan_belajar: kebiasaan,
        gaya_belajar: gaya,
        beban_sks_direncanakan: bebanSKS,
        matkul_tersulit: matkulTersulit,
      })
      setResult(res)
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(0); setResult(null); setError('')
    setTargetIPK(''); setKebiasaan(''); setGaya(''); setMatkulTersulit([])
  }

  if (!open) {
    return (
      <div className="card animate-slide-up border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between gap-4 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white text-sm">Asisten Target IPK</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analisis matematis + panduan personal untuk capai target IPK-mu</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold group-hover:bg-indigo-700 transition-colors flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            Mulai
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Asisten Target IPK</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">IPK saat ini: <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentIPK?.toFixed(2)}</span> · Prediksi: <span className="font-bold">{prediksiIPK?.toFixed(2)}</span></p>
          </div>
        </div>
        <button onClick={() => { setOpen(false); handleReset() }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          Tutup
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.slice(0, 4).map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
              i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-xs hidden sm:inline truncate ${i === step ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400'}`}>{s}</span>
            {i < 3 && <div className={`flex-1 h-0.5 mx-1 rounded ${i < step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Target IPK */}
      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Berapa target IPK yang ingin kamu capai?</p>
          <div>
            <input
              type="number" min="0" max="4" step="0.01"
              value={targetIPK}
              onChange={e => { setTargetIPK(e.target.value); setTargetError(validateTarget(e.target.value)) }}
              placeholder="Contoh: 3.50"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {targetError && <p className="text-xs text-red-500 mt-1">{targetError}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[3.00, 3.50, 3.75].map(v => (
              <button key={v} onClick={() => { setTargetIPK(String(v)); setTargetError('') }}
                className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${parseFloat(targetIPK) === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}>
                {v.toFixed(2)}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p>IPK saat ini: <strong>{currentIPK?.toFixed(2)}</strong> · Prediksi semester ini: <strong>{prediksiIPK?.toFixed(2)}</strong></p>
          </div>
        </div>
      )}

      {/* Step 1: Kebiasaan Belajar */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bagaimana kebiasaan belajarmu sehari-hari?</p>
          {KEBIASAAN_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setKebiasaan(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${kebiasaan === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${kebiasaan === opt.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Gaya Belajar */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Apa gaya belajar yang paling cocok untukmu?</p>
          {GAYA_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setGaya(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${gaya === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${gaya === opt.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`} />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Matkul Tersulit */}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pilih mata kuliah yang paling sulit bagimu (maks. 5):</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {allMatkul.length === 0 && <p className="text-xs text-gray-400">Tidak ada data mata kuliah.</p>}
            {allMatkul.map(mk => (
              <button key={mk.kode} onClick={() => toggleMatkul(mk.kode)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${matkulTersulit.includes(mk.kode) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
                <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${matkulTersulit.includes(mk.kode) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                  {matkulTersulit.includes(mk.kode) && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{mk.nama}</p>
                  <p className="text-xs text-gray-400">{mk.kode} · {mk.sks} SKS · Nilai: {mk.nilai_huruf}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">{matkulTersulit.length}/5 dipilih · Boleh dilewati jika tidak ada</p>
        </div>
      )}

      {/* Step 4: Hasil */}
      {step === 4 && (
        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Menganalisis target IPK-mu...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button onClick={handleReset} className="btn-secondary text-xs flex items-center gap-1.5 mx-auto">
                <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
              </button>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-5">
              {/* Validasi */}
              <ValidasiBadge validasi={result.validasi} />

              {/* Ringkasan Matematis */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Analisis Matematis</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Target IPK', val: result.target_ipk?.toFixed(2), color: 'text-indigo-600 dark:text-indigo-400' },
                    { label: 'IPS Min/Semester', val: result.ips_minimum_per_semester?.toFixed(2), color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Sisa Semester', val: result.sisa_semester, color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Capai di Semester', val: result.estimasi_semester_capai_target ?? '—', color: 'text-emerald-600 dark:text-emerald-400' },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <p className={`text-xl font-extrabold tabular-nums ${item.color}`}>{item.val}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Proyeksi Chart */}
                {result.proyeksi_ipk?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Proyeksi IPK jika IPS minimum tercapai:</p>
                    <ProyeksiChart
                      proyeksi={result.proyeksi_ipk}
                      targetIPK={result.target_ipk}
                      currentIPK={result.ipk_saat_ini}
                      semesterAktif={semesterAktif}
                    />
                  </div>
                )}

                {/* Tabel proyeksi */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-1.5 font-semibold">Semester</th>
                        <th className="text-right py-1.5 font-semibold">IPK Proyeksi</th>
                        <th className="text-right py-1.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.proyeksi_ipk?.map(row => (
                        <tr key={row.semester_ke} className="border-b border-gray-50 dark:border-gray-800">
                          <td className="py-1.5 text-gray-600 dark:text-gray-400">Semester {semesterAktif + row.semester_ke - 1}</td>
                          <td className={`py-1.5 text-right font-bold tabular-nums ${row.ipk_proyeksi >= result.target_ipk ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {row.ipk_proyeksi.toFixed(2)}
                          </td>
                          <td className="py-1.5 text-right">
                            {row.ipk_proyeksi >= result.target_ipk
                              ? <span className="text-emerald-600 dark:text-emerald-400">✓ Target</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panduan Personal */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Panduan Personal</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {result.panduan_personal}
                  </pre>
                </div>
              </div>

              {/* Reset */}
              <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Analisis Ulang dengan Target Berbeda
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => step === 0 ? (setOpen(false), handleReset()) : setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Batal' : 'Kembali'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === 3 ? 'Analisis Sekarang' : 'Lanjut'}
            {step < 3 && <ChevronRight className="w-4 h-4" />}
            {step === 3 && <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
