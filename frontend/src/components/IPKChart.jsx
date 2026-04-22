// ═══════════════════════════════════════════════════════════════════════════
// FILE: frontend/src/components/IPKChart.jsx
// DEVELOPER: Anak 7 (Frontend - Dashboard Components)
// DESKRIPSI: Area chart tren IPS & IPK per semester menggunakan Recharts
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

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
        <p className="text-[10px] text-amber-500 mt-1.5 font-bold italic tracking-wide uppercase">* Nilai prediksi</p>
      )}
    </div>
  )
}

export default function IPKChart({ riwayat, prediksiIPS, prediksiIPK, semesterTarget = 5 }) {
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
      isPredicted: false,
    })
  })

  data.push({
    name: `Sem ${semesterTarget} (Prediksi)`,
    IPS: prediksiIPS,
    IPK: prediksiIPK,
    isPredicted: true,
  })

  const lastTwo = riwayat.slice(-2)
  const trend = lastTwo.length >= 2 ? lastTwo[1].ips - lastTwo[0].ips : 0
  
  let TrendIcon = Minus
  let trendColor = 'text-gray-600 dark:text-gray-400'
  let trendLabel = 'Stabil'
  let trendBg = 'bg-gray-50 dark:bg-gray-800'

  if (trend > 0.05) {
    TrendIcon = TrendingUp
    trendColor = 'text-emerald-600 dark:text-emerald-400'
    trendLabel = 'Meningkat'
    trendBg = 'bg-emerald-50 dark:bg-emerald-900/20'
  } else if (trend < -0.05) {
    TrendIcon = TrendingDown
    trendColor = 'text-red-600 dark:text-red-400'
    trendLabel = 'Menurun'
    trendBg = 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-title">Tren Performa Akademik</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">IPS & IPK per semester</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-transparent shadow-sm ${trendBg} ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">{trendLabel}</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-700/50" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fontWeight: 600 }} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              className="text-gray-400"
            />
            <YAxis 
              domain={[0, 4]} 
              ticks={[0, 1, 2, 3, 4]} 
              tick={{ fontSize: 10, fontWeight: 600 }} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
              className="text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
            />
            <ReferenceLine 
              x={`Sem ${semesterTarget} (Prediksi)`} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ value: 'PREDIKSI', position: 'top', fontSize: 9, fontWeight: 800, fill: '#f59e0b', letterSpacing: '0.1em' }} 
            />
            <Area 
              type="monotone" 
              dataKey="IPS" 
              name="Indeks Prestasi Semester"
              stroke="#6366f1" 
              strokeWidth={3} 
              fill="url(#ipsGradient)" 
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
            <Area 
              type="monotone" 
              dataKey="IPK" 
              name="Indeks Prestasi Kumulatif"
              stroke="#a855f7" 
              strokeWidth={3} 
              fill="url(#ipkGradient)" 
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IPS per semester</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-200" />
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IPK kumulatif</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-amber-400" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Nilai prediksi</span>
        </div>
      </div>
    </div>
  )
}
