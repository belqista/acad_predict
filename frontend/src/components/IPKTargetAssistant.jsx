// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/components/IPKTargetAssistant.jsx
// DEVELOPER: Anak 8 (Frontend - IPK Target Feature)
// DESKRIPSI: Wizard multi-step untuk analisis target IPK mahasiswa.
//            Mengumpulkan input user (target IPK, kebiasaan, gaya belajar,
//            matkul tersulit) lalu kirim ke backend dan tampilkan hasil analisis.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  Target, ChevronRight, ChevronLeft, Loader2, CheckCircle,
  AlertTriangle, XCircle, Sparkles, BarChart2, BookOpen, RefreshCw, X
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
         ReferenceLine, ResponsiveContainer } from 'recharts'
import { postIPKTarget } from '../api/client'

const STEPS = ['Target IPK', 'Kebiasaan Belajar', 'Gaya Belajar', 'Mata Kuliah Sulit', 'Hasil']

const KEBIASAAN_OPTIONS = [
  { value: 'rutin',  label: 'Rutin setiap hari',  desc: 'Belajar terjadwal & konsisten' },
  { value: 'kadang', label: 'Kadang-kadang',       desc: 'Belajar saat ada tugas/ujian' },
  { value: 'jarang', label: 'Jarang',              desc: 'Belajar hanya menjelang ujian' },
]

const GAYA_OPTIONS = [
  { value: 'visual',   label: 'Visual',              desc: 'Diagram, mind map, video' },
  { value: 'membaca',  label: 'Membaca & Mencatat',  desc: 'Buku, ringkasan, catatan' },
  { value: 'diskusi',  label: 'Diskusi',             desc: 'Kelompok belajar, tanya jawab' },
  { value: 'praktek',  label: 'Praktek Langsung',    desc: 'Soal latihan, proyek, lab' },
]

function ValidasiBadge({ validasi }) {
  const cfg = {
    'realistis':     { icon: CheckCircle,   cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' },
    'ambisius':      { icon: AlertTriangle, cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
    'tidak_mungkin': { icon: XCircle,       cls: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400' },
    'tidak_valid':   { icon: XCircle,       cls: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400' }
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

function ProyeksiChart({ proyeksi, targetIPK, currentIPK, semesterAktif }) {
  const data = [
    { name: `Sem ${semesterAktif}`, ipk: currentIPK },
    ...proyeksi.map(r => ({
      name: `Sem ${semesterAktif + r.semester_ke}`,
      ipk: r.ipk_proyeksi
    }))
  ]

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[Math.max(0, currentIPK - 0.5), 4.0]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => [v.toFixed(2), 'IPK Proyeksi']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
          <ReferenceLine y={targetIPK} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: `Target ${targetIPK}`, position: 'right', fontSize: 10, fill: '#f59e0b' }} />
          <Line type="monotone" dataKey="ipk" stroke="#6366f1" strokeWidth={2.5}
            dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function IPKTargetAssistant({ nim, riwayatSemester, semesterAktif, currentIPK, prediksiIPK }) {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const [targetIPK, setTargetIPK] = useState('')
  const [targetError, setTargetError] = useState('')
  const [kebiasaan, setKebiasaan] = useState('')
  const [gaya, setGaya] = useState('')
  const [matkulTersulit, setMatkulTersulit] = useState([])
  const [bebanSKS, setBebanSKS] = useState(22)

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
      prev.includes(kode)
        ? prev.filter(k => k !== kode)
        : prev.length < 5 ? [...prev, kode] : prev
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
    if (step === 0) return !!targetIPK && !validateTarget(targetIPK)
    if (step === 1) return !!kebiasaan
    if (step === 2) return !!gaya
    if (step === 3) return true
    return false
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
        matkul_tersulit: matkulTersulit
      })
      setResult(res)
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 0) {
      const err = validateTarget(targetIPK)
      if (err) {
        setTargetError(err)
        return
      }
    }
    if (step === 3) {
      handleSubmit()
    } else {
      setStep(s => s + 1)
    }
  }

  const handleReset = () => {
    setStep(0)
    setResult(null)
    setError('')
    setTargetIPK('')
    setKebiasaan('')
    setGaya('')
    setMatkulTersulit([])
    setTargetError('')
  }

  if (!open) {
    return (
      <div className="card animate-slide-up border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10">
        <button onClick={() => setOpen(true)} className="w-full flex items-center justify-between gap-4 group text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Asisten Target IPK</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analisis peluang mencapai target IPK impian Anda.</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md group-hover:bg-indigo-500 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Mulai
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-none">Asisten Target IPK</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">IPK Saat ini: {currentIPK.toFixed(2)} · Prediksi: {prediksiIPK.toFixed(2)}</p>
          </div>
        </div>
        <button onClick={() => { setOpen(false); handleReset() }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {step < 4 && (
        <div className="flex items-center gap-1 mb-6">
          {STEPS.slice(0, 4).map((label, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i < step ? 'bg-indigo-600 text-white' :
                i === step ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500' :
                'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-1 rounded ${i < step ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="min-h-[280px]">
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Berapa target IPK impian Anda?</label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.01"
                placeholder="Misal: 3.75"
                value={targetIPK}
                onChange={(e) => { setTargetIPK(e.target.value); setTargetError(validateTarget(e.target.value)) }}
                className={`input-field text-2xl font-bold py-4 ${targetError ? 'border-red-500 ring-red-100' : ''}`}
              />
              {targetError && <p className="text-xs text-red-500 mt-1.5 font-medium">{targetError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {[3.00, 3.50, 3.75].map(v => (
                <button
                  key={v}
                  onClick={() => { setTargetIPK(String(v)); setTargetError('') }}
                  className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    targetIPK === String(v) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {v.toFixed(2)}
                </button>
              ))}
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 flex items-start gap-3">
              <BarChart2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                IPK kumulatif Anda saat ini adalah <strong>{currentIPK.toFixed(2)}</strong>. 
                Sistem memprediksi Anda akan mencapai <strong>{prediksiIPK.toFixed(2)}</strong> pada akhir semester ini.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bagaimana kebiasaan belajar Anda?</p>
            {KEBIASAAN_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setKebiasaan(opt.value)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  kebiasaan === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  kebiasaan === opt.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {kebiasaan === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apa gaya belajar yang paling efektif bagi Anda?</p>
            {GAYA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGaya(opt.value)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  gaya === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  gaya === opt.value ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {gaya === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pilih mata kuliah yang paling sulit bagi Anda:</p>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{matkulTersulit.length}/5 dipilih</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2">
              {allMatkul.map(mk => {
                const isSelected = matkulTersulit.includes(mk.kode)
                const disabled = !isSelected && matkulTersulit.length >= 5
                return (
                  <button
                    key={mk.kode}
                    disabled={disabled}
                    onClick={() => toggleMatkul(mk.kode)}
                    className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
                      disabled ? 'opacity-40 grayscale cursor-not-allowed border-gray-100 dark:border-gray-800' :
                      'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{mk.nama}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">{mk.kode} · {mk.sks} SKS · Nilai: {mk.nilai_huruf}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-gray-400 italic mt-2 text-center">Boleh dilewati jika tidak ada.</p>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">Menganalisis Target Anda...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 text-center">
                <XCircle className="w-16 h-16 text-red-500" />
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white">Analisis Gagal</h4>
                  <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
                <button onClick={handleReset} className="btn-primary py-2 px-6 rounded-xl text-sm">Coba Lagi</button>
              </div>
            ) : result && (
              <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2">
                <ValidasiBadge validasi={result.validasi} />
                
                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <BarChart2 className="w-4 h-4 text-indigo-500" /> Analisis Matematis
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Target IPK</p>
                      <p className="text-2xl font-black text-indigo-600">{result.analisis_matematis.target_ipk.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">IPS Min/Sem</p>
                      <p className="text-2xl font-black text-emerald-600">{result.analisis_matematis.ips_minimum_per_semester.toFixed(2)}</p>
                    </div>
                  </div>

                  {result.proyeksi_ipk?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-gray-500 mb-3">Grafik Proyeksi Menuju Target</p>
                      <ProyeksiChart 
                        proyeksi={result.proyeksi_ipk} 
                        targetIPK={parseFloat(targetIPK)} 
                        currentIPK={currentIPK} 
                        semesterAktif={semesterAktif} 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Panduan Personal
                  </h4>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                    <pre className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {result.panduan_personal}
                    </pre>
                  </div>
                </div>

                <button onClick={handleReset} className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Analisis Ulang
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => step === 0 ? (setOpen(false), handleReset()) : setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Batal' : 'Kembali'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              canNext() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Analisis Sekarang' : 'Lanjut'}
            {step === 3 ? <Sparkles className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  )
}
