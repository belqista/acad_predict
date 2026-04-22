import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value
    const isPredicted = label?.toString().includes('(Prediksi)')
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: <span className="tabular-nums">{Number(p.value).toFixed(2)}</span>
          </p>
        ))}
        {isPredicted && (
          <p className="text-xs text-amber-500 mt-1 italic">* Nilai prediksi</p>
        )}
      </div>
    )
  }
  return null
}

export default function IPKChart({ riwayat, prediksiIPS, prediksiIPK }) {
  // Build chart data
  const data = []

  let cumSks = 0
  let cumPoints = 0

  riwayat.forEach((sem) => {
    cumSks += sem.sks
    cumPoints += sem.ips * sem.sks
    const ipk = cumPoints / cumSks
    data.push({
      name: `Semester ${sem.semester}`,
      IPS: sem.ips,
      IPK: parseFloat(ipk.toFixed(2)),
    })
  })

  // Add predicted semester 5
  data.push({
    name: 'Sem 5 (Prediksi)',
    IPS: prediksiIPS,
    IPK: prediksiIPK,
    isPredicted: true,
  })

  const trend = riwayat.length >= 2
    ? riwayat[riwayat.length - 1].ips - riwayat[riwayat.length - 2].ips
    : 0

  const TrendIcon = trend > 0.05 ? TrendingUp : trend < -0.05 ? TrendingDown : Minus
  const trendColor = trend > 0.05
    ? 'text-emerald-600 dark:text-emerald-400'
    : trend < -0.05
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-600 dark:text-gray-400'
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
              <linearGradient id="ipsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ipkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 4]}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-gray-500 dark:text-gray-400"
              tickLine={false}
              axisLine={false}
              ticks={[0, 1, 2, 3, 4]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            />
            <ReferenceLine
              x="Sem 5 (Prediksi)"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Prediksi', position: 'top', fontSize: 10, fill: '#f59e0b' }}
            />
            <Area
              type="monotone"
              dataKey="IPS"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#ipsGradient)"
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              strokeDasharray={(d) => d.isPredicted ? '5 5' : '0'}
            />
            <Area
              type="monotone"
              dataKey="IPK"
              stroke="#a855f7"
              strokeWidth={2.5}
              fill="url(#ipkGradient)"
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
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
