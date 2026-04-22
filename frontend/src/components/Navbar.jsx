import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Moon, Sun, GraduationCap, BarChart3, X, Menu,
  Cpu, Database, Layers, Search,
  Brain, BookOpen, Zap, BarChart3 as BarIcon,
  ChevronRight, Home
} from 'lucide-react'

const POPUP_CONTENT = {
  'cara-kerja': {
    title: 'Cara Kerja Sistem',
    subtitle: 'Proses prediksi yang transparan dan dapat dipahami',
    color: 'from-indigo-500 to-purple-600',
    steps: [
      { icon: Search,   step: '01', title: 'Masukkan NIM',          desc: 'Masukkan NIM 8 digit mahasiswa. Format: 2 digit tahun + 3 digit kode prodi + 3 digit nomor urut.' },
      { icon: Database, step: '02', title: 'Analisis Data Historis', desc: 'Sistem menganalisis nilai dari semua semester yang telah ditempuh untuk menghitung tren performa akademik.' },
      { icon: Cpu,      step: '03', title: 'Kalkulasi Prediksi',     desc: 'Algoritma weighted average menghitung prediksi IPS, IPK, dan nilai per mata kuliah dengan bobot Sem3:50%, Sem2:30%, Sem1:20%.' },
      { icon: Layers,   step: '04', title: 'Tampilkan Dashboard',    desc: 'Hasil prediksi ditampilkan dalam dashboard lengkap dengan grafik tren, simulasi SKS, dan rekomendasi mata kuliah.' },
    ],
  },
  'fitur': {
    title: 'Fitur Unggulan',
    subtitle: 'Dirancang untuk membantu memantau dan memprediksi performa akademik',
    color: 'from-purple-500 to-pink-600',
    steps: [
      { icon: Brain,   step: null, title: 'Prediksi Berbasis AI',      desc: 'Algoritma prediksi berbasis data historis dengan weighted average dan analisis tren semester.' },
      { icon: BarIcon, step: null, title: 'Visualisasi Tren IPK',      desc: 'Grafik interaktif menampilkan tren performa akademik IPS & IPK dari semester ke semester.' },
      { icon: BookOpen,step: null, title: 'Prediksi Per Mata Kuliah',  desc: 'Prediksi nilai untuk setiap mata kuliah semester berikutnya beserta tingkat kepercayaan.' },
      { icon: Zap,     step: null, title: 'Simulasi Beban SKS',        desc: 'Simulasi 4 skenario SKS dengan prediksi IPS dan IPK untuk setiap pilihan beban studi.' },
    ],
  },
}

function NavPopup({ type, onClose }) {
  const content = POPUP_CONTENT[type]
  if (!content) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-r ${content.color} p-5 sm:p-6 text-white`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold">{content.title}</h2>
              <p className="text-white/80 text-sm mt-1">{content.subtitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {content.steps.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${content.color} flex items-center justify-center shadow flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.step && <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{item.step}</span>}
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-2xl bg-gradient-to-r ${content.color} text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
          >
            Mengerti <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'
  const [popup, setPopup] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavClick = (type) => {
    setMobileOpen(false)
    if (isLanding) {
      const id = type === 'cara-kerja' ? 'how-it-works' : 'features'
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      setPopup(type)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Acad<span className="text-indigo-600 dark:text-indigo-400">Predict</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${isLanding ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Beranda
              </Link>
              <button onClick={() => handleNavClick('cara-kerja')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Cara Kerja
              </button>
              <button onClick={() => handleNavClick('fitur')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Fitur
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {!isLanding && (
                <Link to="/" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <BarChart3 className="w-4 h-4" />
                  <span>Cari Mahasiswa</span>
                </Link>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-1 animate-fade-in">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4 text-indigo-500" />
              Beranda
            </Link>
            <button
              onClick={() => handleNavClick('cara-kerja')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Cpu className="w-4 h-4 text-indigo-500" />
              Cara Kerja
            </button>
            <button
              onClick={() => handleNavClick('fitur')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <Zap className="w-4 h-4 text-indigo-500" />
              Fitur
            </button>
            {!isLanding && (
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Cari Mahasiswa
              </Link>
            )}
          </div>
        )}
      </nav>

      {popup && <NavPopup type={popup} onClose={() => setPopup(null)} />}
    </>
  )
}
