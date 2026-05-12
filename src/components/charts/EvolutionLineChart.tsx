'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MatchStat } from '@/lib/types'

interface Props {
  data: MatchStat[]
  metric: keyof MatchStat
}

function avg(vals: (number | null)[]): number {
  const valid = vals.filter((v): v is number => v !== null)
  if (!valid.length) return 0
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

export default function EvolutionLineChart({ data, metric }: Props) {
  const byMatch: Record<string, MatchStat[]> = {}
  for (const row of data) {
    const key = row.match_date || row.match_name
    if (!byMatch[key]) byMatch[key] = []
    byMatch[key].push(row)
  }

  const chartData = Object.entries(byMatch)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({
      date,
      Equipo: avg(rows.map((r) => r[metric] as number | null)),
      Backs: avg(rows.filter((r) => r.family === 'back').map((r) => r[metric] as number | null)),
      Forwards: avg(rows.filter((r) => r.family === 'forward').map((r) => r[metric] as number | null)),
    }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#F9FAFB' }}
        />
        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
        <Line type="monotone" dataKey="Equipo" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Backs" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Forwards" stroke="#06b6d4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
