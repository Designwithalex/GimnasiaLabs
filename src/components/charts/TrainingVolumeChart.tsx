'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export interface TrainingSession {
  id: string
  year: number
  week: number
  day: 'lunes' | 'martes' | 'jueves'
  distance_m: number
  sprint_distance_m: number
  player_load: number
}

interface Props {
  sessions: TrainingSession[]
}

type Metric = 'distance_m' | 'sprint_distance_m' | 'player_load'

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const METRIC_LABELS: Record<Metric, string> = {
  distance_m: 'Distancia Total (m)',
  sprint_distance_m: 'Dist. Alta Velocidad (m)',
  player_load: 'Player Load',
}

const DAY_COLORS = { lunes: '#10b981', martes: '#06b6d4', jueves: '#f59e0b' }

function getMondayOfWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const mondayW1 = new Date(jan4)
  mondayW1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const monday = new Date(mondayW1)
  monday.setDate(mondayW1.getDate() + (week - 1) * 7)
  return monday
}

const selectClass = 'bg-gray-800 border border-gray-700 text-gray-100 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500'

export default function TrainingVolumeChart({ sessions }: Props) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [monthFilter, setMonthFilter] = useState<number | null>(null)
  const [metric, setMetric] = useState<Metric>('distance_m')

  const yearSessions = sessions.filter((s) => s.year === year)

  let weeksToShow: number[]
  if (monthFilter !== null) {
    weeksToShow = Array.from({ length: 53 }, (_, i) => i + 1).filter((w) => {
      const monday = getMondayOfWeek(year, w)
      return monday.getMonth() === monthFilter && monday.getFullYear() === year
    })
  } else {
    const weeksWithData = new Set(yearSessions.map((s) => s.week))
    weeksToShow = Array.from(weeksWithData).sort((a, b) => a - b)
  }

  const chartData = weeksToShow.map((week) => {
    const monday = getMondayOfWeek(year, week)
    const label = `Sem ${week} (${monday.getDate()} ${MONTHS_ES[monday.getMonth()].slice(0, 3)})`
    const get = (d: 'lunes' | 'martes' | 'jueves') => {
      const s = yearSessions.find((x) => x.week === week && x.day === d)
      return s ? Math.round(s[metric] * 10) / 10 : 0
    }
    return { name: label, lunes: get('lunes'), martes: get('martes'), jueves: get('jueves') }
  })

  const hasData = chartData.some((d) => d.lunes > 0 || d.martes > 0 || d.jueves > 0)

  const years = Array.from(
    new Set([currentYear, currentYear - 1, ...sessions.map((s) => s.year)])
  ).sort((a, b) => b - a)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Año</span>
          <select className={selectClass} value={year} onChange={(e) => { setYear(Number(e.target.value)); setMonthFilter(null) }}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Mes</span>
          <select className={selectClass} value={monthFilter ?? ''} onChange={(e) => setMonthFilter(e.target.value === '' ? null : Number(e.target.value))}>
            <option value="">Todo el año</option>
            {MONTHS_ES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Métrica</span>
          <select className={selectClass} value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
            {(Object.entries(METRIC_LABELS) as [Metric, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
          No hay sesiones guardadas para {monthFilter !== null ? MONTHS_ES[monthFilter] : 'este año'}.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} interval={0} angle={-35} textAnchor="end" />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => metric === 'player_load' ? String(v) : `${v}m`} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#F9FAFB', fontSize: 12 }}
              formatter={(v, name: string) => [
                metric === 'player_load' ? Number(v).toFixed(1) : `${Number(v).toLocaleString('es-AR')}m`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
            <Bar dataKey="lunes" fill={DAY_COLORS.lunes} radius={[3, 3, 0, 0]} name="lunes" />
            <Bar dataKey="martes" fill={DAY_COLORS.martes} radius={[3, 3, 0, 0]} name="martes" />
            <Bar dataKey="jueves" fill={DAY_COLORS.jueves} radius={[3, 3, 0, 0]} name="jueves" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
