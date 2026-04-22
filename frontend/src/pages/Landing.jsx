// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/pages/Landing.jsx
// DEVELOPER: Anak 6 (Frontend - Landing Page)
// DESKRIPSI: Halaman utama (home) dengan hero section, search NIM,
//            stats, fitur, program studi, cara kerja, CTA, dan footer
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ArrowRight, Brain, BarChart3, BookOpen, Users,
  Zap, TrendingUp, GraduationCap, Star,
  ChevronRight, Cpu, Database, Layers, Monitor, Calculator, Settings, FileText
} from 'lucide-react'
import { InlineSpinner } from '../components/LoadingSpinner'
import { getStudent } from '../api/client'

const PRODI_LIST = [
  { name: 'Teknologi Informasi',      key: 'TI', color: 'from-indigo-400 to-blue-500',   icon: Monitor,    desc: 'Fokus pada pengembangan software, jaringan, dan keamanan siber.' },
  { name: 'Akuntansi',                key: 'AK', color: 'from-emerald-400 to-teal-500',  icon: Calculator, desc: 'Mempelajari audit, perpajakan, dan sistem informasi akuntansi.' },
  { name: 'Teknik Mesin',             key: 'TM', color: 'from-orange-400 to-red-500',    icon: Settings,   desc: 'Mendalami perancangan manufaktur, energi, dan otomotif.' },
  { name: 'Administrasi Perkantoran', key: 'AP', color: 'from-violet-400 to-purple-500', icon: FileText,   desc: 'Menguasai manajemen arsip, korespondensi, dan tata kelola kantor.' },
]

const FEATURES = [
  { icon: Brain,    title: 'Prediksi Berbasis AI',     desc: 'Estimasi nilai IPS dan IPK masa depan menggunakan analisis data historis.', color: 'from-indigo-500 to-blue-600' },
  { icon: BarChart3,title: 'Visualisasi Tren IPK',     desc: 'Grafik interaktif yang menampilkan perkembangan akademik antar semester.', color: 'from-purple-500 to-pink-600' },
  { icon: BookOpen, title: 'Prediksi Per Mata Kuliah', desc: 'Detail estimasi nilai untuk setiap mata kuliah pada semester aktif.', color: 'from-emerald-500 to-teal-600' },
  { icon: Zap,      title: 'Simulasi Beban SKS',       desc: 'Coba skenario jumlah SKS dan lihat dampaknya terhadap proyeksi IPK.', color: 'from-amber-500 to-orange-600' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Masukkan NIM',          desc: 'Input 8 digit nomor induk mahasiswa Anda.', icon: Search },
  { step: '02', title: 'Analisis Data Historis', desc: 'Sistem menarik data nilai dari semester sebelumnya.', icon: Database },
  { step: '03', title: 'Kalkulasi Prediksi',     desc: 'Algoritma menghitung estimasi performa terbaru.', icon: Cpu },
  { step: '04', title: 'Tampilkan Dashboard',    desc: 'Dashboard interaktif siap membantu perencanaan Anda.', icon: Layers },
]

function validateNIM(nim) {
  if (!/^\d{8}$/.test(nim)) {
    return 'NIM harus terdiri dari 8 digit angka.'
  }
  return null
}

export default function Landing() {
  const [nim, setNim] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const handleSearch = async (searchNim = nim) => {
    const trimmed = searchNim.trim()
    const validationError = validateNIM(trimmed)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)
    try {
      await getStudent(trimmed)
      navigate(`/dashboard/${trimmed}`)
    } catch (err) {
      setError(err.message || 'Mahasiswa tidak ditemukan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="absolute -top-40 -right-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-600/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            Sistem Prediksi Akademik Generasi Baru
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6 animate-slide-up">
            Prediksi Masa Depan <span className="gradient-text">Akademikmu</span>
            <br className="hidden sm:block" /> Dengan Data Nyata
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 animate-fade-in px-2">
            Gunakan kekuatan data historis untuk memproyeksikan IPK Anda, mensimulasikan beban SKS, dan merencanakan strategi belajar yang lebih efektif.
          </p>

          <div ref={searchRef} className="max-w-lg mx-auto animate-slide-up px-0">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />
              <div className="relative flex gap-2 p-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="flex-1 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 min-w-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan NIM (misal: 24026004)"
                    value={nim}
                    onChange={(e) => { setNim(e.target.value); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    maxLength={8}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-sm sm:text-base font-medium min-w-0"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="btn-primary py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl flex-shrink-0 justify-center text-sm"
                >
                  {loading ? (
                    <><InlineSpinner /><span className="hidden sm:inline">Mencari...</span></>
                  ) : (
                    <><span>Cari</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 animate-fade-in text-left">
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center text-white">
          {[
            { value: '500+', label: 'Total Mahasiswa', icon: Users },
            { value: '4',    label: 'Program Studi',   icon: GraduationCap },
            { value: '6',    label: 'Semester',        icon: BookOpen },
            { value: '95%',  label: 'Akurasi Prediksi',icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
              <p className="text-2xl sm:text-3xl font-extrabold">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/70 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" className="py-14 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Fitur Unggulan</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Dirancang untuk memberikan wawasan mendalam tentang perjalanan akademik Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="card hover:shadow-lg transition-shadow group">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-3 sm:mb-4 shadow group-hover:scale-105 transition-transform`}>
                  <feat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PROGRAM STUDI */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Program Studi</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Mencakup 4 program studi utama dengan ribuan data historis akademik.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PRODI_LIST.map((prodi) => {
              const Icon = prodi.icon
              return (
                <div key={prodi.key} className="card text-center hover:shadow-lg transition-shadow group cursor-default p-4 sm:p-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${prodi.color} flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{prodi.name}</p>
                  <p className="text-xs text-gray-500 mt-2 hidden sm:block">{prodi.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Cara Kerja</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Proses prediksi yang transparan dan dapat dipahami oleh siapa saja.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && (
                  <div
                    className="hidden lg:block absolute top-8 h-0.5 bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-800 z-0"
                    style={{ width: 'calc(100% - 2rem)', left: '50%' }}
                  />
                )}
                <div className="card text-center relative z-10 p-4 sm:p-6">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                    {step.step}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-1 mb-1.5 sm:mb-2 text-sm sm:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 sm:mb-4">
            Mulai Prediksi Sekarang
          </h2>
          <p className="text-indigo-100 mb-6 sm:mb-8 text-base sm:text-lg">
            Masukkan NIM mahasiswa dan dapatkan analisis lengkap dalam hitungan detik.
          </p>
          <button
            onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 transition-all duration-200 text-base sm:text-lg"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Cari Mahasiswa
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <span className="font-bold text-white text-sm sm:text-base">AcadPredict</span>
          </div>
          <p className="text-xs sm:text-sm">Sistem Prediksi Performa Akademik Mahasiswa</p>
          <p className="text-xs mt-1.5 sm:mt-2 text-gray-500">
            Data bersifat sintetis untuk keperluan demonstrasi. Prediksi tidak menggantikan konsultasi akademik resmi.
          </p>
        </div>
      </footer>
    </div>
  )
}
