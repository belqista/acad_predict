import { User, Hash, BookOpen, Calendar, Award, TrendingUp } from 'lucide-react'

const PRODI_COLORS = {
  TI: 'from-indigo-500 to-blue-600',
  AK: 'from-emerald-500 to-teal-600',
  TM: 'from-orange-500 to-red-600',
  AP: 'from-violet-500 to-purple-600',
}

const PRODI_BADGE_COLORS = {
  TI: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  AK: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  TM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  AP: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
}

function IPKBar({ value }) {
  const pct = (value / 4.0) * 100
  const color =
    value >= 3.5
      ? 'from-emerald-400 to-green-500'
      : value >= 3.0
      ? 'from-blue-400 to-indigo-500'
      : value >= 2.5
      ? 'from-yellow-400 to-amber-500'
      : 'from-red-400 to-rose-500'

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function StudentCard({ student }) {
  const { nim, nama, prodi, prodi_key, angkatan, jenis_kelamin, semester_aktif, ipk_kumulatif } = student

  const gradient = PRODI_COLORS[prodi_key] || 'from-gray-500 to-gray-600'
  const badgeClass = PRODI_BADGE_COLORS[prodi_key] || 'bg-gray-100 text-gray-800'

  const ipkLabel =
    ipk_kumulatif >= 3.5
      ? 'Cumlaude'
      : ipk_kumulatif >= 3.0
      ? 'Sangat Memuaskan'
      : ipk_kumulatif >= 2.5
      ? 'Memuaskan'
      : 'Perlu Perhatian'

  const ipkLabelColor =
    ipk_kumulatif >= 3.5
      ? 'text-emerald-600 dark:text-emerald-400'
      : ipk_kumulatif >= 3.0
      ? 'text-blue-600 dark:text-blue-400'
      : ipk_kumulatif >= 2.5
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400'

  return (
    <div className="card animate-slide-up overflow-hidden">
      {/* Header gradient strip */}
      <div className={`-mx-6 -mt-6 mb-6 h-2 bg-gradient-to-r ${gradient}`} />

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg`}>
          {nama.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{nama}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
              {prodi_key}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{prodi}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoItem icon={Hash} label="NIM" value={nim} />
            <InfoItem icon={Calendar} label="Angkatan" value={angkatan} />
            <InfoItem icon={BookOpen} label="Semester" value={`Semester ${semester_aktif}`} />
            <InfoItem icon={User} label="Jenis Kelamin" value={jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
          </div>
        </div>

        {/* IPK display */}
        <div className="flex-shrink-0 text-center sm:text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">IPK Kumulatif</p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white tabular-nums">{ipk_kumulatif.toFixed(2)}</p>
          <p className={`text-xs font-semibold mt-1 ${ipkLabelColor}`}>{ipkLabel}</p>
          <div className="w-24 mx-auto sm:mx-0 sm:ml-auto mt-2">
            <IPKBar value={ipk_kumulatif} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">dari 4.00</p>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{value}</p>
      </div>
    </div>
  )
}
