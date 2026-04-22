import { BookCheck, Info } from 'lucide-react'

const SKS_CONFIG = {
  24: {
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-300',
    label: 'Beban Penuh',
    desc: 'IPK >= 3.5 — Mahasiswa berprestasi dapat mengambil beban maksimum',
  },
  23: {
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    label: 'Beban Tinggi',
    desc: 'IPK >= 3.0 — Performa sangat baik, dapat mengambil beban lebih',
  },
  22: {
    color: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-300',
    label: 'Beban Normal',
    desc: 'IPK >= 2.5 — Beban SKS standar yang direkomendasikan',
  },
  21: {
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    label: 'Beban Ringan',
    desc: 'IPK < 2.5 — Disarankan mengambil beban lebih sedikit untuk fokus perbaikan',
  },
}

export default function SKSBadge({ rekomendasi_sks, prediksi_ipk }) {
  const config = SKS_CONFIG[rekomendasi_sks] || SKS_CONFIG[22]

  return (
    <div className={`card ${config.bg} border ${config.border} animate-slide-up`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <BookCheck className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white">Rekomendasi SKS</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.text} ${config.bg} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-5xl font-extrabold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
              {rekomendasi_sks}
            </span>
            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">SKS</span>
          </div>
          <div className={`flex items-start gap-1.5 text-sm ${config.text}`}>
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{config.desc}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Prediksi IPK</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {prediksi_ipk?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress bar showing SKS relative to max 24 */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
          <span>Beban SKS</span>
          <span>{rekomendasi_sks} / 24 SKS maksimum</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${config.color} transition-all duration-700`}
            style={{ width: `${(rekomendasi_sks / 24) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
