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
  sub_family: string
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

const SUB_FAMILY_ORDER = ['Front Row', 'Locks', 'Back Row', 'Inside Backs', 'Outside Backs']

const SF_COLORS: Record<string, string> = {
  'Front Row':     '#ef4444',
  'Locks':         '#f59e0b',
  'Back Row':      '#10b981',
  'Inside Backs':  '#06b6d4',
  'Outside Backs': '#8b5cf6',
}

const DAY_SHORT: Record<string, string> = { lunes: 'Lun', martes: 'Mar', jueves: 'Jue' }
const DAYS_ORDER = ['lunes', 'martes', 'jueves']

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

  // Build week+day combos to show
  let combosToShow: { week: number; day: string }[]
  if (monthFilter !== null) {
    const weeksInMonth = Array.from({ length: 53 }, (_, i) => i + 1).filter((w) => {
      const monday = getMondayOfWeek(year, w)
      return monday.getMonth() === monthFilter && monday.getFullYear() === year
    })
    combosToShow = weeksInMonth.flatMap((week) =>
      DAYS_ORDER.map((day) => ({ week, day }))
    )
  } else {
    const seen = new Set<string>()
    for (const s of yearSessions) {
      seen.add(`${s.week}|${s.day}`)
    }
    combosToShow = Array.from(seen)
      .map((c) => { const [w, d] = c.split('|'); return { week: Number(w), day: d } })
      .sort((a, b) => a.week !== b.week ? a.week - b.week : DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day))
  }

  const chartData = combosToShow.map(({ week, day }) => {
    const monday = getMondayOfWeek(year, week)
    const name = `S${week} ${DAY_SHORT[day]} (${monday.getDate()} ${MONTHS_ES[monday.getMonth()].slice(0, 3)})`
    const point: Record<string, string | number> = { name }
    for (const sf of SUB_FAMILY_ORDER) {
      const entry = yearSessions.find((s) => s.week === week && s.day === day && s.sub_family === sf)
      point[sf] = entry ? Math.round(entry[metric] * 10) / 10 : 0
    }
    return point
  })

  const hasData = chartData.some((d) => SUB_FAMILY_ORDER.some((sf) => Number(d[sf]) > 0))

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
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 9 }} interval={0} angle={-40} textAnchor="end" />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => metric === 'player_load' ? String(v) : `${v}m`} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#F9FAFB', fontSize: 12 }}
              formatter={(v, name) => [
                metric === 'player_load' ? Number(v).toFixed(1) : `${Number(v).toLocaleString('es-AR')}m`,
                String(name),
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            {SUB_FAMILY_ORDER.map((sf) => (
              <Bar key={sf} dataKey={sf} stackId="stack" fill={SF_COLORS[sf]} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
