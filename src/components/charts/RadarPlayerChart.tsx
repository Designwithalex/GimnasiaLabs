'use client'

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend
} from 'recharts'
import { MatchStat } from '@/lib/types'

interface Props {
  data: MatchStat[]
}

function avg(vals: (number | null)[]): number {
  const valid = vals.filter((v): v is number => v !== null)
  if (!valid.length) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function normalize(val: number, max: number) {
  return max > 0 ? (val / max) * 100 : 0
}

export default function RadarPlayerChart({ data }: Props) {
  const backs = data.filter((d) => d.family === 'back')
  const forwards = data.filter((d) => d.family === 'forward')

  const metrics: { key: keyof MatchStat; label: string }[] = [
    { key: 'distance_m', label: 'Distancia' },
    { key: 'top_speed_kmh', label: 'Top Speed' },
    { key: 'player_load', label: 'Player Load' },
    { key: 'sprint_distance_m', label: 'Sprint Dist' },
    { key: 'power_score', label: 'Power Score' },
  ]

  const backAvgs = metrics.map((m) => avg(backs.map((d) => d[m.key] as number | null)))
  const fwdAvgs = metrics.map((m) => avg(forwards.map((d) => d[m.key] as number | null)))
  const maxes = metrics.map((_, i) => Math.max(backAvgs[i], fwdAvgs[i]))

  const chartData = metrics.map((m, i) => ({
    metric: m.label,
    Backs: Math.round(normalize(backAvgs[i], maxes[i])),
    Forwards: Math.round(normalize(fwdAvgs[i], maxes[i])),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <Radar name="Backs" dataKey="Backs" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
        <Radar name="Forwards" dataKey="Forwards" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
        <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
